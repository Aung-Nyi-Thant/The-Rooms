import { getSession } from "@/lib/auth";
import ChatShell from "@/components/chat/ChatShell";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <ChatShell currentUserId={session.user.id} />
    );
}
