import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedBadge, VerifiedLabel } from "@/components/ui/VerifiedLabel";

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  return `${Math.floor(diffMs / day)}d`;
}

function InboxRow({ conversation, currentUserId }: { conversation: ReturnType<typeof useMessages>["conversations"][number]; currentUserId: string }) {
  const navigate = useNavigate();
  const otherId = conversation.participantIds.find((id) => id !== currentUserId);
  const other = useMemo(() => {
    if (!otherId) return null;
    return mockUsers.find((u) => u.id === otherId) ?? null;
  }, [otherId]);

  const isUnread = conversation.unreadCount > 0;
  const isLastMine = conversation.lastSenderId === currentUserId;

  return (
    <button className="messages-row" onClick={() => navigate(`/app/messages/${conversation.id}`)}>
      <div className="messages-row__avatar">
        <img src={other?.photoUrl} alt={other?.displayName} />
        {isUnread && <span className="messages-row__unread-dot" />}
      </div>

      <div className="messages-row__content">
        <div className="messages-row__header">
          <span className="messages-row__name">{other?.displayName ?? "Unknown"}</span>
          {other?.verified && <VerifiedBadge className="messages-row__verified" />}
          <span className="messages-row__time">{formatRelativeTime(conversation.lastMessageAt)}</span>
        </div>
        <p className={`messages-row__preview ${isUnread ? "messages-row__preview--unread" : ""}`}>
          {isLastMine && conversation.lastMessage ? "You: " : ""}
          {conversation.lastMessage || "Start the conversation"}
        </p>
      </div>
    </button>
  );
}

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, startConversation } = useMessages();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const visibleConversations = conversations.filter((conv) => conv.participantIds.includes(user?.id ?? ""));

  const availableCreators = useMemo(() => mockUsers.filter((creator) => creator.id !== user?.id), [user?.id]);

  const handleStartConversation = (targetUserId: string) => {
    if (!user) return;
    const conversationId = startConversation([user.id, targetUserId]);
    setIsComposerOpen(false);
    navigate(`/app/messages/${conversationId}`);
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1 className="messages-header__title">Messages</h1>
        <button className="messages-header__new" onClick={() => setIsComposerOpen(!isComposerOpen)}>
          {isComposerOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {isComposerOpen && (
        <div className="messages-composer__picker">
          <p className="messages-composer__title">New Message</p>
          <div className="messages-composer__list">
            {availableCreators.map((creator) => (
              <button key={creator.id} className="messages-composer__creator-btn" onClick={() => handleStartConversation(creator.id)}>
                <img src={creator.photoUrl} alt={creator.displayName} className="messages-composer__creator-avatar" />
                <div className="messages-composer__creator-info">
                  <VerifiedLabel
                    text={creator.displayName}
                    verified={creator.verified}
                    className="messages-composer__creator-name"
                    textClassName="messages-composer__creator-name"
                    iconClassName="messages-composer__creator-verified"
                  />
                  <span className="messages-composer__creator-username">@{creator.username}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-inbox">
        {visibleConversations.length === 0 ? (
          <div className="messages-inbox__empty">
            <p>No messages yet</p>
            <span>Start a conversation with a creator</span>
          </div>
        ) : (
          visibleConversations.map((conv) => <InboxRow key={conv.id} conversation={conv} currentUserId={user?.id ?? ""} />)
        )}
      </div>
    </div>
  );
}
