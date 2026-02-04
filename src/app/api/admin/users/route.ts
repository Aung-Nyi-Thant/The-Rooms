import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();

    if (!session || session.user?.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                username: true,
                role: true,
                created_at: true,
                last_login: true,
                status: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("User fetch error:", error);
        return NextResponse.json({ error: "Access denied" }, { status: 500 });
    }
}
