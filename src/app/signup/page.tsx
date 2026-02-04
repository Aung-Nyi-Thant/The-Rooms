"use client";

import SignupForm from "@/components/auth/SignupForm";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function SignupPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[360px] space-y-12">
                <header className="relative text-center">
                    <Link
                        href="/login"
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                        <MoveLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-light tracking-tight text-white/90 uppercase tracking-[0.2em]">
                        Sign Up
                    </h1>
                </header>

                <SignupForm />

                <footer className="text-center">
                    <p className="text-xs text-white/30 font-light uppercase tracking-widest">
                        Invite-only access
                    </p>
                </footer>
            </div>
        </main>
    );
}
