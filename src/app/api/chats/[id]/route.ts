import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> } // Fix for Next.js 15 params
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const chatId = params.id;

        // Check if member exists
        const membership = await prisma.chatMember.findUnique({
            where: {
                chatId_userId: {
                    chatId: chatId,
                    userId: session.user.id
                }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Fetch members to notify them via socket
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { members: true }
        });

        if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

        const memberIds = chat.members.map(m => m.userId);

        // Delete the entire chat. Prisma Cascade will handle members and messages.
        await prisma.chat.delete({
            where: { id: chatId }
        });

        return NextResponse.json({ success: true, memberIds });
    } catch (error) {
        console.error("Delete chat error:", error);
        return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }
}
