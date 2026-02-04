import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { login } from '@/lib/auth';

// Simple in-memory rate limiting (for demonstration, use Redis/upstash in production)
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

const RATE_LIMIT_TRIALS = 5;
const RATE_LIMIT_DURATION = 10 * 60 * 1000; // 10 minutes

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Basic rate limiting
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip);

    if (rateLimit) {
        if (now - rateLimit.lastAttempt < RATE_LIMIT_DURATION && rateLimit.count >= RATE_LIMIT_TRIALS) {
            return NextResponse.json({ error: 'Access denied' }, { status: 429 });
        }

        // Reset if duration passed
        if (now - rateLimit.lastAttempt >= RATE_LIMIT_DURATION) {
            rateLimitMap.set(ip, { count: 0, lastAttempt: now });
        }
    }

    try {
        const { username, accessKey } = await request.json();

        if (!username || !accessKey) {
            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user || user.status !== 'active') {
            // Record attempt
            const current = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };
            rateLimitMap.set(ip, { count: current.count + 1, lastAttempt: now });

            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(accessKey, user.access_key_hash);

        if (!isValid) {
            // Record attempt
            const current = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };
            rateLimitMap.set(ip, { count: current.count + 1, lastAttempt: now });

            return NextResponse.json({ error: 'Access denied' }, { status: 401 });
        }

        // Success: Update last_login
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });

        // Create session
        await login({ id: user.id, username: user.username, role: user.role });

        return NextResponse.json({ success: true, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Access denied' }, { status: 500 });
    }
}
