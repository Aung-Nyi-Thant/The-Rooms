"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Search, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
    id: string;
    username: string;
    isOnline: boolean;
}

interface CreateChatModalProps {
    onClose: () => void;
    currentUserId: string;
}

export default function CreateChatModal({ onClose, currentUserId }: CreateChatModalProps) {
    const [step, setStep] = useState<"select_type" | "details">("select_type");
    const [chatType, setChatType] = useState<"personal" | "group">("personal"); // Actually user said "+" is for Group, but let's support both properly?
    // User request: "when we create group, we can add people".
    // It's safer to just default to Group creation flow if that's the primary intent, OR offer selection.
    // Let's offer a simple toggle or just assume "New Chat" means selecting people.
    // If 1 person selected -> Personal. If >1 -> Group? Or explicit mode switch.
    // Explicit is better.

    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [groupName, setGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/users");
                if (res.ok) {
                    setUsers(await res.json());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleUser = (id: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedUserIds(newSet);
    };

    const handleCreate = async () => {
        if (selectedUserIds.size === 0) return;
        if (chatType === "group" && !groupName.trim()) return;

        setIsCreating(true);
        try {
            // Determine type automatically if not explicit? No, explicit is best.
            // Actually, if we are in 'group' mode, we need name.

            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: chatType,
                    name: chatType === "group" ? groupName : undefined,
                    members: Array.from(selectedUserIds)
                })
            });

            if (res.ok) {
                const chat = await res.json();
                router.push(`/chat/${chat.id}`);
                onClose();
            }
        } catch (error) {
            console.error("Failed to create chat", error);
        } finally {
            setIsCreating(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#1a1a1a] border border-[#333] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#1a1a1a]">
                    <h2 className="text-white font-medium">New Conversation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">

                    {/* Type Toggle */}
                    <div className="flex bg-[#111] p-1 rounded-lg shrink-0">
                        <button
                            onClick={() => { setChatType("personal"); setSelectedUserIds(new Set()); }}
                            className={`flex-1 text-sm py-1.5 rounded-md transition-all ${chatType === "personal" ? "bg-[#333] text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setChatType("group")}
                            className={`flex-1 text-sm py-1.5 rounded-md transition-all ${chatType === "group" ? "bg-[#333] text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            Group
                        </button>
                    </div>

                    {/* Group Name Input */}
                    {chatType === "group" && (
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-[#5e6ad2]"
                        />
                    )}

                    {/* User Selection */}
                    <div className="flex-1 overflow-y-auto border border-[#333] rounded-lg bg-[#111]">
                        {isLoading ? (
                            <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-5 h-5 text-gray-500" /></div>
                        ) : (
                            <div className="divide-y divide-[#222]">
                                {users
                                    .filter(user => user.id !== currentUserId)
                                    .map(user => {
                                        const isSelected = selectedUserIds.has(user.id);
                                        // In personal mode, only allow 1 selection
                                        const isDisabled = chatType === "personal" && selectedUserIds.size >= 1 && !isSelected;

                                        return (
                                            <button
                                                key={user.id}
                                                onClick={() => !isDisabled && toggleUser(user.id)}
                                                disabled={isDisabled}
                                                className={`w-full flex items-center gap-3 p-3 hover:bg-[#222] transition-colors text-left ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-[#5e6ad2] border-[#5e6ad2]" : "border-[#444] bg-transparent"}`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-200">{user.username}</p>
                                                </div>
                                                {user.isOnline && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                            </button>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
                    <button
                        onClick={handleCreate}
                        disabled={selectedUserIds.size === 0 || (chatType === "group" && !groupName) || isCreating}
                        className="w-full bg-[#5e6ad2] hover:bg-[#4d59c1] disabled:bg-[#333] disabled:text-gray-500 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isCreating && <Loader2 className="animate-spin w-4 h-4" />}
                        {chatType === "group" ? "Create Group" : "Start Chat"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
