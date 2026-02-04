import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // Format for UI
        const formattedChats = chats.map(chat => {
            const isGroup = chat.type === "group";
            let name = chat.name;
            let otherUser = null;

            if (!isGroup) {
                // Personal chat: find the other member
                const otherMember = chat.members.find(m => m.userId !== session.user.id);
                if (otherMember) {
                    name = otherMember.user.username;
                    otherUser = otherMember.user;
                } else {
                    // Start of self-chat handling
                    const selfMember = chat.members.find(m => m.userId === session.user.id);
                    if (selfMember) {
                        name = "Me (Note to Self)";
                        otherUser = selfMember.user;
                    } else {
                        name = "Unknown User";
                    }
                }
            }

            return {
                id: chat.id,
                type: chat.type,
                name: name,
                lastMessage: chat.messages[0] ? {
                    content: chat.messages[0].content,
                    createdAt: chat.messages[0].createdAt
                } : null,
                unreadCount: 0, // TODO: Implement unread tracking
                isGroup,
            };
        });

        return NextResponse.json(formattedChats);
    } catch (error) {
        console.error("Fetch chats error:", error);
        const { appendFileSync } = require("fs");
        appendFileSync("error.log", `Error in GET /api/chats: ${error}\n${JSON.stringify(error, null, 2)}\n`);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, members, name } = await request.json(); // members: array of userIds

        if (!members || !Array.isArray(members) || members.length === 0) {
            return NextResponse.json({ error: "Invalid members" }, { status: 400 });
        }

        // Add current user to members if not present
        const allMemberIds = Array.from(new Set([...members, session.user.id]));

        // Check for existing personal chat
        if (type === "personal" && allMemberIds.length === 2) {
            const otherUserId = members.find(id => id !== session.user.id);
            // Complex query to find if a chat already exists between these two
            // For MVP, just create a new one or let client handle duplicates?
            // Better to check.

            /* 
            // Logic to check existing personal chat:
            const existing = await prisma.chat.findFirst({
               where: {
                   type: "personal",
                   AND: [
                       { members: { some: { userId: session.user.id } } },
                       { members: { some: { userId: otherUserId } } }
                   ]
               }
            });
            if (existing) return NextResponse.json(existing);
            */
        }

        // Check if users exist for debugging
        const { appendFileSync } = require("fs");
        try {
            /*
            const validUsers = await prisma.user.findMany({
                where: { id: { in: allMemberIds } },
                select: { id: true, username: true }
            });
            appendFileSync("debug_post.log", `Valid users found: ${JSON.stringify(validUsers)}\nTarget IDs: ${JSON.stringify(allMemberIds)}\n`);
            */
            appendFileSync("debug_post.log", `Attempting to create chat. Type: ${type}, Name: ${name}, Members: ${JSON.stringify(allMemberIds)}\nSession User: ${session.user.id}\n`);
        } catch (e) { }

        const chat = await prisma.chat.create({
            data: {
                type: type || "personal",
                name: type === "group" ? name : null,
                members: {
                    create: allMemberIds.map(userId => ({
                        userId,
                        role: userId === session.user.id && type === "group" ? "owner" : "member"
                    }))
                }
            }
        });

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Create chat error:", error);
        const { appendFileSync } = require("fs");
        appendFileSync("error.log", `Error in POST /api/chats: ${error}\n${JSON.stringify(error, null, 2)}\n`);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
}
