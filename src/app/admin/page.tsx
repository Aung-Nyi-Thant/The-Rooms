"use client";

import { useState, useEffect } from "react";
import { Loader2, Key, Users, Ticket, RefreshCw, Trash2, Copy, Check, Home } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

type Token = {
    id: string;
    expires_at: string | null;
    used_at: string | null;
    used_by: string | null;
    created_at: string;
};

type User = {
    id: string;
    username: string;
    role: string;
    created_at: string;
    last_login: string | null;
    status: string;
};

export default function AdminDashboard() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState<string>("24");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tokensRes, usersRes] = await Promise.all([
                fetch("/api/admin/tokens"),
                fetch("/api/admin/users"),
            ]);
            const [tokensData, usersData] = await Promise.all([
                tokensRes.json(),
                usersRes.json(),
            ]);
            setTokens(tokensData || []);
            setUsers(usersData || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateToken = async () => {
        setIsGenerating(true);
        setGeneratedToken(null);
        try {
            const res = await fetch("/api/admin/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expires_in_hours: parseInt(expiresIn) }),
            });
            const data = await res.json();
            if (data.token) {
                setGeneratedToken(data.token);
                fetchData();
            }
        } catch (error) {
            console.error("Generate error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const revokeToken = async (id: string) => {
        try {
            await fetch(`/api/admin/tokens/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Revoke error:", error);
        }
    };

    const copyToClipboard = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading && tokens.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#121212]">
                <Loader2 className="w-8 h-8 animate-spin text-[#5e6ad2]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-gray-200 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-center border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-light tracking-widest uppercase text-white/90">
                            Admin Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/chat"
                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span>Room</span>
                        </Link>
                        <button
                            onClick={fetchData}
                            className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-500 hover:text-white"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <LogoutButton />
                    </div>
                </header>

                {/* Section 1: Token Generator */}
                <section className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-lg space-y-6">
                    <div className="flex items-center gap-3 text-[#5e6ad2]">
                        <Key className="w-5 h-5" />
                        <h2 className="text-lg font-medium tracking-tight">Token Generator</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500">Expiration (Hours)</label>
                            <input
                                type="number"
                                value={expiresIn}
                                onChange={(e) => setExpiresIn(e.target.value)}
                                className="w-full bg-[#242424] border border-[#333333] px-4 py-2 text-sm focus:border-[#5e6ad2] focus:outline-none"
                                placeholder="24"
                            />
                        </div>
                        <button
                            onClick={generateToken}
                            disabled={isGenerating}
                            className="bg-[#5e6ad2] hover:bg-[#4d59c1] disabled:bg-gray-800 px-6 py-2 text-sm font-medium text-white transition-all flex items-center gap-2 h-[38px]"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Signup Token"}
                        </button>
                    </div>

                    {generatedToken && (
                        <div className="mt-6 p-4 bg-[#242424] border border-dashed border-[#5e6ad2] rounded flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Raw Token (Copy now, it won't be shown again)</p>
                                <code className="text-sm text-[#5e6ad2] break-all">{generatedToken}</code>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="ml-4 p-2 hover:bg-gray-700 rounded transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Section 2: Token List */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-[#5e6ad2]">
                            <Ticket className="w-5 h-5" />
                            <h2 className="text-lg font-medium tracking-tight">Token List</h2>
                        </div>
                        <div className="overflow-x-auto border border-gray-800 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1a1a1a] text-gray-500 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Expires At</th>
                                        <th className="px-4 py-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {(tokens || []).map((token) => {
                                        const isExpired = token.expires_at && new Date(token.expires_at) < new Date();
                                        const isUsed = !!token.used_at;
                                        let status = "unused";
                                        if (isUsed) status = "used";
                                        else if (isExpired) status = "expired";

                                        return (
                                            <tr key={token.id} className="hover:bg-gray-900/50 transition-colors">
                                                <td className="px-4 py-4 capitalize">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${status === 'unused' ? 'bg-green-900/40 text-green-400' :
                                                        status === 'used' ? 'bg-blue-900/40 text-blue-400' :
                                                            'bg-red-900/40 text-red-400'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-gray-400">
                                                    {token.expires_at ? new Date(token.expires_at).toLocaleString() : 'Never'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {!isUsed && !isExpired && (
                                                        <button
                                                            onClick={() => revokeToken(token.id)}
                                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                                            title="Revoke Token"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!tokens || tokens.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-600 italic">No tokens generated yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 3: User List */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-[#5e6ad2]">
                            <Users className="w-5 h-5" />
                            <h2 className="text-lg font-medium tracking-tight">User List</h2>
                        </div>
                        <div className="overflow-x-auto border border-gray-800 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1a1a1a] text-gray-500 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Username</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium">Last Login</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {(users || []).map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                                            <td className="px-4 py-4 font-medium">{user.username}</td>
                                            <td className="px-4 py-4 capitalize text-gray-500">
                                                <span className={user.role === 'admin' ? 'text-[#5e6ad2]' : ''}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-400">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
