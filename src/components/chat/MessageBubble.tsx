import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FileText, Play, AlertCircle, Timer } from "lucide-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    currentUserIsSender: boolean;
    createdAt: string;
    type: "text" | "image" | "voice" | "file";
    expiresAt?: string | null;
}

interface MessageBubbleProps {
    message: Message;
    showTimestamp?: boolean;
}

export default function MessageBubble({ message, showTimestamp }: MessageBubbleProps) {
    const [isExpired, setIsExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!message.expiresAt) return;

        const checkExpiry = () => {
            const now = new Date();
            const expiry = new Date(message.expiresAt!);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
            } else {
                // Determine sensible unit
                if (diff < 60000) setTimeLeft(`${Math.ceil(diff / 1000)}s`);
                else if (diff < 3600000) setTimeLeft(`${Math.ceil(diff / 60000)}m`);
                else setTimeLeft(`${Math.ceil(diff / 3600000)}h`);
            }
        };

        checkExpiry();
        const interval = setInterval(checkExpiry, 1000); // Check every second
        return () => clearInterval(interval);
    }, [message.expiresAt]);

    if (isExpired) {
        return (
            <div className={`flex w-full ${message.currentUserIsSender ? "justify-end" : "justify-start"} mb-2`}>
                <div className="px-4 py-2 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center gap-2 opacity-50">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 italic">Message expired</span>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (message.type) {
            case "image":
                return (
                    <img
                        src={message.content}
                        alt="Image attachment"
                        className="rounded-lg max-w-full max-h-[300px] object-cover border border-white/10"
                        loading="lazy"
                    />
                );
            case "voice":
                return (
                    <div className="min-w-[200px] flex items-center gap-2">
                        <audio controls className="h-8 max-w-[240px]" src={message.content} />
                    </div>
                );
            case "file":
                return (
                    <a
                        href={message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                    >
                        <div className="p-2 bg-white/10 rounded">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate max-w-[150px]">File Attachment</p>
                            <p className="text-[10px] opacity-70">Click to open</p>
                        </div>
                    </a>
                );
            default:
                return (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                    </p>
                );
        }
    };

    return (
        <div className={`flex w-full ${message.currentUserIsSender ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm relative group ${message.currentUserIsSender
                    ? "bg-[#5e6ad2] text-white rounded-br-sm"
                    : "bg-[#2a2a2a] text-gray-200 rounded-bl-sm"
                }`}>
                {renderContent()}

                <div className="flex items-center justify-end gap-2 mt-1 min-h-[14px]">
                    {timeLeft && (
                        <span className="text-[10px] flex items-center gap-0.5 text-yellow-300/80 font-medium">
                            <Timer className="w-3 h-3" />
                            {timeLeft}
                        </span>
                    )}
                    {showTimestamp && (
                        <span className={`text-[10px] block opacity-60 text-right`}>
                            {format(new Date(message.createdAt), "HH:mm")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
