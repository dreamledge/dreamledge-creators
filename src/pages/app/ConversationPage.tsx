import { useParams } from "react-router-dom";
import { ChatInput } from "@/components/messages/ChatInput";
import { ChatThread } from "@/components/messages/ChatThread";
import { mockMessages } from "@/lib/constants/mockData";

export function ConversationPage() {
  const { conversationId } = useParams();
  const messages = mockMessages.filter((message) => message.conversationId === conversationId);
  return (
    <div className="space-y-4">
      <ChatThread messages={messages} />
      <ChatInput />
    </div>
  );
}
