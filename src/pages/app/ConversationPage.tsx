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
    <div className="conversation-page">
      <div className="conversation-page__thread">
        <ChatThread messages={conversationMessages} currentUserId={user?.id ?? ""} />
      </div>
      {conversationId && user ? (
        <div className="conversation-page__composer">
          <ChatInput conversationId={conversationId} senderId={user.id} />
        </div>
      ) : null}
    </div>
  );
}
