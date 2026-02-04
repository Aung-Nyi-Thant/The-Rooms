"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface ChatRoomProps {
    chatId: string;
    currentUserId: string;
}

export default function ChatRoom({ chatId, currentUserId }: ChatRoomProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [chatName, setChatName] = useState("Chat");
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Initialize Socket & Fetch History
    useEffect(() => {
        // 1. Fetch History
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chats/${chatId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                    setChatName(data.chatName || "Chat");
                }
            } catch (error) {
                console.error("Error loading history", error);
            } finally {
                setIsLoading(false);
                setTimeout(scrollToBottom, 200);
            }
        };

        fetchHistory();

        // 2. Connect Socket
        // Ensure we only create one connection
        if (!socketRef.current) {
            socketRef.current = io(); // Defaults to same host/port
        }

        const socket = socketRef.current;

        socket.emit("join-chat", chatId);

        socket.on("new-message", (message: any) => {
            setMessages((prev) => {
                // Deduplicate: if we have a temp message with same content/timestamp or if we optimistically added it
                // For now, simpler to just append unique IDs.
                if (prev.find(m => m.id === message.id)) return prev;
                // If it's a file from other user
                return [...prev, message];
            });
            setTimeout(scrollToBottom, 100);
        });

        socket.on("chat-closed", (closedChatId: string) => {
            if (closedChatId === chatId) {
                alert("This chat has been deleted.");
                window.location.href = "/chat";
            }
        });

        return () => {
            socket.off("new-message");
            socket.off("chat-closed");
            // Do not disconnect socket ...
        };
    }, [chatId]);

    const handleSendMessage = async (content: string, type: "text" | "image" | "voice" | "file", expiresIn?: number) => {
        if (!socketRef.current) return;

        // Optimistic UI update (optional, but good for perceived speed)
        // We'll skip optimistic for now to avoid complexity with duplicate keys until server responds.
        // Actually, let's just rely on the server broadcast which is very fast locally.

        socketRef.current.emit("send-message", {
            chatId,
            content,
            senderId: currentUserId,
            type,
            expiresIn
        });
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#121212]"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>;

    return (
        <div className="flex flex-col h-screen bg-[#121212]">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#121212]/95 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/chat" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-lg font-bold text-white/90 truncate max-w-[200px]">
                        {chatName}
                    </h2>
                </div>
                <button className="text-gray-400 hover:text-white p-2">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={msg.id}
                        message={{ ...msg, currentUserIsSender: msg.senderId === currentUserId }}
                        showTimestamp={true}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}
