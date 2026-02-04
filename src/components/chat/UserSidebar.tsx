"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, ChevronRight, User } from "lucide-react";

interface UserData {
    id: string;
    username: string;
    isOnline: boolean;
}

export default function UserSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Error loading users", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [isOpen]); // Refresh when opened

    const router = useRouter();

    const handleUserClick = async (targetUserId: string) => {
        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "personal",
                    members: [targetUserId]
                })
            });

            if (res.ok) {
                const chat = await res.json();
                router.push(`/chat/${chat.id}`);
                setIsOpen(false); // Close sidebar on mobile/desktop
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed left-0 top-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-l-0 border-gray-700 p-2 rounded-r-lg z-40 text-gray-400 hover:text-white transition-transform duration-300 ${isOpen ? "-translate-x-full" : "translate-x-0"}`}
                title="Show Users"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Sidebar Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-[280px] bg-[#0a0a0a] border-r border-[#333] transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-[#222] flex items-center justify-between">
                    <h2 className="text-sm font-light uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Members
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-white p-1"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-4 text-xs text-gray-600 text-center animate-pulse">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="p-4 text-xs text-gray-600 text-center">No users found</div>
                    ) : (
                        users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleUserClick(user.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group text-left"
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-gray-400 group-hover:text-gray-200">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div
                                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${user.isOnline ? "bg-green-500" : "bg-gray-600"
                                            }`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 truncate font-medium">
                                        {user.username}
                                    </p>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wide">
                                        {user.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer / Stats */}
                <div className="p-4 border-t border-[#222] text-[10px] text-gray-600 uppercase tracking-widest text-center">
                    {users.filter(u => u.isOnline).length} Online / {users.length} Total
                </div>
            </div>

            {/* Overlay to close (optional, for better UX on mobile) */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                />
            )}
        </>
    );
}
