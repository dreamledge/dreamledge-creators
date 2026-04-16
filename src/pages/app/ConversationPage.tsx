import { useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { ChatInput } from "@/components/messages/ChatInput";
import { ChatThread } from "@/components/messages/ChatThread";

export function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { messages } = useMessages();
  const conversationMessages = messages.filter((message) => message.conversationId === conversationId);

  return (
    <div className="space-y-4">
      <ChatThread messages={conversationMessages} currentUserId={user?.id ?? ""} />
      {conversationId && user ? <ChatInput conversationId={conversationId} senderId={user.id} /> : null}
    </div>
  );
}
