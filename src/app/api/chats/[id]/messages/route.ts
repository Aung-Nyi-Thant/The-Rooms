import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const chatId = params.id;

        // Verify membership
        const membership = await prisma.chatMember.findUnique({
            where: {
                chatId_userId: {
                    chatId: chatId,
                    userId: session.user.id
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Get Chat Details (Name) & Messages
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                members: {
                    include: { user: true }
                },
                messages: {
                    orderBy: { createdAt: "asc" }, // Oldest first for chat log
                    take: 50 // Limit content for now
                }
            }
        });

        if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

        // Determine Chat Name if personal
        let chatName = chat.name;
        if (chat.type === "personal") {
            const otherMember = chat.members.find(m => m.userId !== session.user.id);
            chatName = otherMember ? otherMember.user.username : "Unknown User";
        }

        return NextResponse.json({
            chatName,
            messages: chat.messages
        });

    } catch (error) {
        console.error("Fetch history error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
