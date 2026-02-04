import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { token, username, password } = await request.json();

        // 1. Verify Token
        const foundToken = await prisma.signupToken.findFirst({
            where: {
                used_at: null,
                // Check if token matches by trying to compare later, or if stored hash matches input (requires input to be raw token)
                // Actually, backend stores hash. User provides raw token. We need to verify raw token against all active hashes? 
                // No, that's inefficient.
                // Correction: The logical way is for the admin to generate a token, give it to the user.
                // We need to find a token that validates against the input.
                // Since we can't search by hash, we might need to rethink the schema OR fetch all unused tokens and compare.
                // Fetching all unused tokens is acceptable for a small private app.
            }
        });

        // Wait, secure tokens are usually stored hashed. To verify, we need the raw token.
        // If we only store the hash, we have to iterate through all unused tokens.
        const unusedTokens = await prisma.signupToken.findMany({
            where: { used_at: null }
        });

        let validTokenRecord = null;
        for (const t of unusedTokens) {
            // Check expiry
            if (t.expires_at && new Date(t.expires_at) < new Date()) continue;

            const isMatch = await bcrypt.compare(token, t.token_hash);
            if (isMatch) {
                validTokenRecord = t;
                break;
            }
        }

        if (!validTokenRecord) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // 2. Check Username
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: {
                username,
                access_key_hash: hashedPassword,
                role: "user",
                status: "active"
            }
        });

        // 4. Mark Token Used
        await prisma.signupToken.update({
            where: { id: validTokenRecord.id },
            data: {
                used_at: new Date(),
                used_by: newUser.id
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }
}
