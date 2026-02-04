import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession();

    if (!session || session.user?.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    try {
        const { id } = params;

        // Revoking means marking as used with a specific indicator or just deleting
        // Requirement: "Revoking marks token as used/invalid"
        // We'll mark used_at as now to invalidate it
        await prisma.signupToken.update({
            where: { id },
            data: { used_at: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Token revocation error:", error);
        return NextResponse.json({ error: "Access denied" }, { status: 500 });
    }
}
