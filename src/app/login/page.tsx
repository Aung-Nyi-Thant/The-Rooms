import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex text-white overflow-hidden bg-[#121212]">
            {/* Lottie/Image Side (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative bg-[#1a1a1a] items-center justify-center border-r border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                <div className="relative z-10 text-center space-y-6 max-w-lg p-12">
                    <h2 className="text-4xl font-bold tracking-tight">Connect Freely.</h2>
                    <p className="text-gray-400 text-lg">
                        Experience real-time conversations with a privacy-first approach.
                        Join The Rooms today.
                    </p>
                    {/* Abstract decorative elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
                </div>
            </div>

            {/* Login Form Side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                <div className="w-full max-w-[360px] space-y-12">
                    <header className="text-center">
                        <h1 className="text-2xl font-light tracking-tight text-white/90 uppercase tracking-[0.2em]">
                            The Rooms
                        </h1>
                        <p className="mt-2 text-xs text-gray-500 uppercase tracking-widest pl-1">Sign In</p>
                    </header>

                    <LoginForm />

                    <footer className="text-center">
                        <p className="text-xs text-white/30 font-light uppercase tracking-widest">
                            Invite-only access
                        </p>
                    </footer>
                </div>
            </div>
        </main>
    );
}
