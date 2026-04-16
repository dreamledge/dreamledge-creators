import { Link } from "react-router-dom";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { ConversationModel } from "@/types/models";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < month) return `${Math.floor(diffMs / day)}d ago`;
  if (diffMs < year) return `${Math.floor(diffMs / month)}mo ago`;
  return `${Math.floor(diffMs / year)}yr ago`;
}

export function MessagePreviewCard({ conversation, currentUserId }: { conversation: ConversationModel; currentUserId: string }) {
  const targetId = conversation.participantIds.find((id) => id !== currentUserId) ?? currentUserId;
  const target = mockUsers.find((user) => user.id === targetId);
  const lastSender = mockUsers.find((user) => user.id === conversation.lastSenderId);
  const previewPrefix = !conversation.lastMessage
    ? ""
    : conversation.lastSenderId === currentUserId
      ? "You: "
      : `${lastSender?.displayName ?? target?.displayName ?? "Creator"}: `;

  return (
    <Link to={`/app/messages/${conversation.id}`} className="message-preview-row">
      <img src={target?.photoUrl} alt={target?.displayName} className="message-preview-row__avatar" />
      <div className="message-preview-card__content">
        <VerifiedLabel text={target?.displayName ?? "Creator"} verified={target?.verified} className="message-preview-card__title" textClassName="message-preview-card__title" iconClassName="verified-label__icon--tiny" />
        <p className="message-preview-card__body">{conversation.lastMessage ? `${previewPrefix}${conversation.lastMessage}` : "Start the conversation"}</p>
      </div>
      <span className="message-preview-row__time">{formatRelativeTime(conversation.lastMessageAt)}</span>
    </Link>
  );
}
