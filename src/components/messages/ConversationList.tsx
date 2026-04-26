import { MessagePreviewCard } from "@/components/cards/MessagePreviewCard";
import type { ConversationModel, UserModel } from "@/types/models";

export function ConversationList({ items, currentUserId, allUsers }: { items: ConversationModel[]; currentUserId: string; allUsers: UserModel[] }) {
  return <div className="space-y-3">{items.map((item) => <MessagePreviewCard key={item.id} conversation={item} currentUserId={currentUserId} allUsers={allUsers} />)}</div>;
}
