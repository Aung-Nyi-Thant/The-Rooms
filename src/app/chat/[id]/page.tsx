import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatRoom from "@/components/chat/ChatRoom";

interface PageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function ChatRoomPage({ params }: PageProps) {
    const session = await getSession();
    if (!session) redirect("/login");

    const resolvedParams = await params;

    return (
        <ChatRoom chatId={resolvedParams.id} currentUserId={session.user.id} />
    );
}
