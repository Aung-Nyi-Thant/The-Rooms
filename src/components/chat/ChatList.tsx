"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import LogoutButton from "@/components/auth/LogoutButton";
import ChatListItem from "./ChatListItem";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Loader2, Plus } from "lucide-react";

interface ChatListProps {
    currentUserId: string;
    onOpenCreateModal: () => void;
    isCreateModalOpen: boolean;
}

export default function ChatList({ currentUserId, onOpenCreateModal, isCreateModalOpen }: ChatListProps) {
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Delete handling
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Connect Socket
        if (!socketRef.current) {
            socketRef.current = io();
        }
        const socket = socketRef.current;

        socket.emit("identify", currentUserId);

        socket.on("chat-removed", (removedChatId: string) => {
            setChats(prev => prev.filter(c => c.id !== removedChatId));
        });

        // Also listen for new messages to update list order/unread (Bonus!)
        // socket.on("new-message", ...) - maybe later

        return () => {
            socket.off("chat-removed");
        };
    }, [currentUserId]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch("/api/chats");
                if (res.ok) {
                    const data = await res.json();
                    setChats(data);
                }
            } catch (error) {
                console.error("Error loading chats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChats();
    }, [isCreateModalOpen]); // Refresh when modal closes (created new chat)

    const requestDelete = (chatId: string) => {
        setChatToDelete(chatId);
    };

    const confirmDelete = async () => {
        if (!chatToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/chats/${chatToDelete}`, {
                method: "DELETE"
            });

            if (res.ok) {
                const data = await res.json(); // contains memberIds
                setChats(prev => prev.filter(c => c.id !== chatToDelete));

                // Broadcast deletion
                socketRef.current?.emit("broadcast-delete-chat", {
                    chatId: chatToDelete,
                    memberIds: data.memberIds
                });

                setChatToDelete(null);
            } else {
                console.error("Failed to delete chat");
            }
        } catch (error) {
            console.error("Error deleting chat", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#121212]">
            <header className="p-4 flex items-center justify-between border-b border-gray-800/50 sticky top-0 bg-[#121212]/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <LogoutButton />
                </div>

                <h1 className="text-xl font-light tracking-widest uppercase text-white/90 absolute left-1/2 -translate-x-1/2">
                    Chats
                </h1>

                <button
                    onClick={onOpenCreateModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    title="New Chat"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            <ConfirmationModal
                isOpen={!!chatToDelete}
                title="Delete Chat"
                message="Are you sure you want to remove this chat? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setChatToDelete(null)}
                isLoading={isDeleting}
            />

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4 min-h-[50vh]">
                        <p className="text-sm font-light uppercase tracking-widest">No active chats</p>
                        {/* Start conversation button removed as per request (now centralized in ChatShell) */}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800/30">
                        {chats.map(chat => (
                            <ChatListItem key={chat.id} chat={chat} onDelete={requestDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
