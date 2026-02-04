"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Send, Mic, Image as ImageIcon, FileText, Timer, X, Square } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (content: string, type: "text" | "image" | "voice" | "file", expiresIn?: number) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [timerDuration, setTimerDuration] = useState<number | null>(null); // in seconds
    const [uploading, setUploading] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message, "text", timerDuration || undefined);
        setMessage("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // File Handling
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadAndSend(file);
        setIsMenuOpen(false);
    };

    const uploadAndSend = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                let type: "image" | "voice" | "file" = "file";
                if (file.type.startsWith("image/")) type = "image";
                if (file.type.startsWith("audio/")) type = "voice";

                // For file/image, 'content' is the URL
                onSendMessage(data.url, type, timerDuration || undefined);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    // Voice Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const audioFile = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });
                await uploadAndSend(audioFile);

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsMenuOpen(false);
        } catch (err) {
            console.error("Mic error", err);
            alert("Could not access microphone"); // Simple feedback
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Format timer label
    const getTimerLabel = () => {
        if (!timerDuration) return null;
        if (timerDuration < 60) return `${timerDuration}s`;
        if (timerDuration < 3600) return `${Math.floor(timerDuration / 60)}m`;
        return `${Math.floor(timerDuration / 3600)}h`;
    };

    return (
        <div className="bg-[#121212] border-t border-gray-800 p-2 pb-safe relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Attachment Menu */}
            {isMenuOpen && (
                <div className="absolute bottom-16 left-4 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl p-2 flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50 w-48">
                    {/* Timer Selection */}
                    <div className="px-2 py-1">
                        <p className="text-[10px] uppercase text-gray-500 font-bold mb-2">Ephemeral Timer</p>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {[null, 10, 60, 3600].map((t) => (
                                <button
                                    key={t || "off"}
                                    onClick={() => setTimerDuration(t)}
                                    className={`text-xs p-1 rounded ${timerDuration === t ? "bg-[#5e6ad2] text-white" : "bg-[#222] text-gray-400"}`}
                                >
                                    {t ? (t < 60 ? `${t}s` : t < 3600 ? `${t / 60}m` : "1h") : "Off"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-800 my-1" />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-gray-300 text-sm"
                    >
                        <ImageIcon className="w-4 h-4 text-[#5e6ad2]" />
                        Image / File
                    </button>
                    {/* Voice trigger via menu or direct? Let's keep direct button if possible, but user asked for functions. 
                        Let's put voice in menu too for completeness or distinct button.
                    */}
                    <button
                        onMouseDown={startRecording}
                        // For desktop click
                        onClick={startRecording}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-gray-300 text-sm"
                    >
                        <Mic className="w-4 h-4 text-[#5e6ad2]" />
                        Voice Note
                    </button>
                </div>
            )}

            {/* Active Timer Indicator */}
            {timerDuration && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5e6ad2] text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Timer className="w-3 h-3" />
                    <span>Disappears in {getTimerLabel()}</span>
                    <button onClick={() => setTimerDuration(null)} className="ml-1 hover:text-red-200"><X className="w-3 h-3" /></button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-3 rounded-full transition-colors flex-shrink-0 ${isMenuOpen ? "bg-[#5e6ad2] text-white" : "text-gray-400 hover:text-white bg-white/5"}`}
                >
                    <Plus className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? "rotate-45" : ""}`} />
                </button>

                {isRecording ? (
                    <div className="flex-1 h-[46px] bg-red-900/20 border border-red-500/50 rounded-2xl flex items-center justify-between px-4 animate-pulse">
                        <span className="text-red-400 text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            Recording...
                        </span>
                        <button onClick={stopRecording} className="p-1 bg-red-500 rounded text-white">
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-gray-800 focus-within:border-[#5e6ad2] transition-colors">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full bg-transparent text-white px-4 py-3 max-h-[120px] resize-none focus:outline-none text-sm placeholder:text-gray-600"
                        />
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={!message.trim() && !uploading}
                    className="p-3 rounded-full bg-[#5e6ad2] text-white disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-all flex-shrink-0"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send className="w-5 h-5 ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
