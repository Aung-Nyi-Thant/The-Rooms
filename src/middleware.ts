import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Specific routes to protect
const protectedRoutes = ["/chat"];
const publicRoutes = ["/login", "/"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = req.cookies.get("session")?.value;
    let session = null;

    if (cookie) {
        try {
            session = await decrypt(cookie);
        } catch (e) {
            // Invalid session
        }
    }

    // Redirect to /login if the user is not authenticated and trying to access a protected route
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Redirect to /chat if the user is authenticated and trying to access a public route
    if (isPublicRoute && session && !path.startsWith("/chat")) {
        return NextResponse.redirect(new URL("/chat", req.nextUrl));
    }

    // Role-based protection: Admin only
    if (path.startsWith("/admin")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }

        // Check both top-level role and nested user.role to be safe
        const userRole = session?.role || session?.user?.role;

        if (userRole !== "admin") {
            const detected = userRole || "undefined";
            return NextResponse.redirect(new URL(`/chat?error=unauthorized_admin&detected_role=${detected}`, req.nextUrl));
        }
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
