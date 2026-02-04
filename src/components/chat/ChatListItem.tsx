import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

interface Chat {
    id: string;
    type: "personal" | "group";
    name: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    } | null;
    unreadCount: number;
}

interface ChatListItemProps {
    chat: Chat;
    onDelete?: (id: string) => void;
}

export default function ChatListItem({ chat, onDelete }: ChatListItemProps) {
    const timeAgo = chat.lastMessage
        ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })
            .replace("about ", "")
            .replace("less than a minute", "now")
        : "";

    return (
        <div className="relative group">
            <Link href={`/chat/${chat.id}`} className="block w-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors duration-200">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-base font-bold text-gray-100 truncate">
                                {chat.name}
                            </h3>
                            {chat.lastMessage && (
                                <span className="text-[10px] text-gray-500 font-light tracking-wide uppercase flex-shrink-0 ml-2">
                                    {timeAgo}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate font-light mt-0.5">
                            {chat.lastMessage ? chat.lastMessage.content : <span className="italic opacity-50">Empty chat</span>}
                        </p>
                    </div>

                    {chat.unreadCount > 0 && (
                        <div className="w-2 h-2 rounded-full bg-[#5e6ad2] flex-shrink-0 ml-2 animate-pulse"></div>
                    )}
                </div>
            </Link>

            {/* Delete Action - Visible on hover or swipe (simple hover for now) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(chat.id);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-900/20 text-red-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/40 hover:text-red-500 z-10"
                title="Delete Chat"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
