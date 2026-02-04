"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [accessKey, setAccessKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const usernameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focus username on load
    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent, target: string = "/chat") => {
        e.preventDefault();
        if (!username || !accessKey || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, accessKey }),
            });

            if (response.ok) {
                const data = await response.json();
                // If it's the admin user and they clicked the Admin button, go to /admin
                // Otherwise, respect the provided target or default to /chat
                if (data.role === "admin" && target === "/admin") {
                    router.push("/admin");
                } else {
                    router.push("/chat");
                }
                router.refresh();
            } else {
                setError("Access denied");
                setAccessKey(""); // Clear access key on failure
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }
        } catch (err) {
            setError("Access denied");
            setAccessKey("");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = !username || !accessKey || isLoading;

    return (
        <form
            onSubmit={(e) => handleSubmit(e, "/chat")}
            className={`space-y-6 ${isShaking ? "animate-shake" : ""}`}
        >
            <div className="space-y-4">
                <div>
                    <input
                        ref={usernameRef}
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Access Key"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        autoComplete="current-password"
                        className="w-full bg-[#1a1a1a] border border-[#333333] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#5e6ad2] focus:outline-none transition-colors duration-200"
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full bg-[#5e6ad2] hover:bg-[#4d59c1] disabled:bg-gray-800 disabled:text-gray-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        "Login"
                    )}
                </button>

                {username === "Username001" && accessKey === "Accmobile@001" && !isLoading && (
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e as any, "/admin")}
                        className="w-full mt-4 border border-[#5e6ad2] text-[#5e6ad2] hover:bg-[#5e6ad2] hover:text-white px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        Admin Dashboard
                    </button>
                )}

                <div className="mt-6 text-center">
                    <Link href="/signup" className="text-xs text-gray-500 hover:text-[#5e6ad2] transition-colors uppercase tracking-wider">
                        Have an invite token?
                    </Link>
                </div>
            </div>

            {error && (
                <p className="text-center text-xs text-red-500/80 font-medium">
                    {error}
                </p>
            )}
        </form>
    );
}
