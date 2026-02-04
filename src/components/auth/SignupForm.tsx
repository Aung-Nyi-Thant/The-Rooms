"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupForm() {
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, username, password }),
            });

            if (response.ok) {
                router.push("/login?signup=success");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to sign up");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Invite Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5e6ad2] hover:bg-[#4d59c1] disabled:bg-gray-800 disabled:text-gray-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </button>

            {error && (
                <p className="text-center text-xs text-red-500/80 font-medium">
                    {error}
                </p>
            )}
        </form>
    );
}
