import { MessagePreviewCard } from "@/components/cards/MessagePreviewCard";
import type { ConversationModel } from "@/types/models";

export function ConversationList({ items, currentUserId }: { items: ConversationModel[]; currentUserId: string }) {
  return <div className="space-y-3">{items.map((item) => <MessagePreviewCard key={item.id} conversation={item} currentUserId={currentUserId} />)}</div>;
}
