import UserSidebar from "@/components/chat/UserSidebar";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative w-full h-full">
            <UserSidebar />
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
}
