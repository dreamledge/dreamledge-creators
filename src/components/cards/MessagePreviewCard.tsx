import { Link } from "react-router-dom";
import { mockUsers } from "@/lib/constants/mockData";
import type { ConversationModel } from "@/types/models";

export function MessagePreviewCard({ conversation, currentUserId }: { conversation: ConversationModel; currentUserId: string }) {
  const targetId = conversation.participantIds.find((id) => id !== currentUserId) ?? currentUserId;
  const target = mockUsers.find((user) => user.id === targetId);

  return (
    <Link to={`/app/messages/${conversation.id}`} className="flex items-center gap-3 bubble-card rounded-[34px] p-4">
      <img src={target?.photoUrl} alt={target?.displayName} className="h-12 w-12 rounded-[28px] object-cover" />
      <div className="min-w-0">
        <p className="font-medium text-text-primary">{target?.displayName}</p>
        <p className="truncate text-sm text-text-secondary">{conversation.lastMessage}</p>
      </div>
    </Link>
  );
}
