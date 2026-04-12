import { useAuth } from "@/app/providers/AuthProvider";
import { ConversationList } from "@/components/messages/ConversationList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockConversations } from "@/lib/constants/mockData";

export function MessagesPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Messages" title="Direct creator conversations" />
      <ConversationList items={mockConversations} currentUserId={user?.id ?? "u1"} />
    </div>
  );
}
