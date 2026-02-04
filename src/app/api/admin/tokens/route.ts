import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await getSession();

    if (!session || session.user?.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
        const { expires_in_hours } = await request.json();

        // Generate raw token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(rawToken, 12);

        let expiresAt = null;
        if (expires_in_hours) {
            expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000);
        }

        await prisma.signupToken.create({
            data: {
                token_hash: tokenHash,
                expires_at: expiresAt,
                created_by: session.user.id,
            },
        });

        // Return raw token ONCE
        return NextResponse.json({ token: rawToken });
    } catch (error) {
        console.error("Token generation error:", error);
        return NextResponse.json({ error: "Access denied" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getSession();

    if (!session || session.user?.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
        const tokens = await prisma.signupToken.findMany({
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                expires_at: true,
                used_at: true,
                used_by: true,
                created_at: true,
            },
        });

        return NextResponse.json(tokens);
    } catch (error) {
        console.error("Token fetch error:", error);
        return NextResponse.json({ error: "Access denied" }, { status: 500 });
    }
}
