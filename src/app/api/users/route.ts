import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                last_login: true,
            },
            orderBy: {
                username: 'asc'
            }
        });

        const now = new Date();
        const formattedUsers = users.map(user => {
            // Determine online status (active in last 15 mins)
            // Note: last_login is only updated on login, not every request, 
            // so this is a rough approximation without sockets/heartbeat.
            // For demo purposes, this is acceptable.
            const lastLogin = user.last_login ? new Date(user.last_login) : null;
            const isOnline = lastLogin && (now.getTime() - lastLogin.getTime() < 15 * 60 * 1000);

            return {
                id: user.id,
                username: user.username,
                isOnline: isOnline || false, // Fallback
                lastLogin: user.last_login
            };
        });

        // Sort: Online first
        formattedUsers.sort((a, b) => (a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
