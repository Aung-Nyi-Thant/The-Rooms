"use client";

import { useState } from "react";
import ChatList from "./ChatList";
import CreateChatModal from "./CreateChatModal";
import { MessageSquareDashed, Plus } from "lucide-react";

interface ChatShellProps {
    currentUserId: string;
}

export default function ChatShell({ currentUserId }: ChatShellProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#121212] flex-col md:flex-row overflow-hidden">
            {/* Sidebar / List - Fixed width on desktop */}
            <div className="w-full md:w-80 lg:w-96 border-r border-gray-800 flex-none bg-[#121212] z-10">
                <ChatList
                    currentUserId={currentUserId}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    isCreateModalOpen={isCreateModalOpen} // pass it potentially to trigger refreshes
                />
            </div>

            {/* Empty State for Desktop */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-[#1a1a1a] text-gray-500 flex-col gap-6 p-8 text-center relative overflow-hidden">

                {/* Background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2 z-10 ring-1 ring-white/10">
                    <MessageSquareDashed className="w-10 h-10 opacity-50" />
                </div>

                <div className="space-y-2 z-10 max-w-md">
                    <h3 className="text-xl font-medium text-white/90">Welcome to The Rooms</h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">
                        Select a chat from the sidebar to continue your conversation, or start a new one directly here.
                    </p>
                </div>

                <div className="z-10 mt-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Start New Conversation
                    </button>
                </div>
            </div>

            {isCreateModalOpen && <CreateChatModal onClose={() => setIsCreateModalOpen(false)} currentUserId={currentUserId} />}
        </div>
    );
}
