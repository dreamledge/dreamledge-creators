import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";
import { ChatInput } from "@/components/messages/ChatInput";
import { ChatThread } from "@/components/messages/ChatThread";

export function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getConversation, getMessages, markSeen, isTypingUser } = useMessages();

  const conversation = getConversation(conversationId ?? "");
  const messages = getMessages(conversationId ?? "");

  const otherParticipantId = useMemo(() => {
    if (!conversation || !user) return null;
    return conversation.participantIds.find((id) => id !== user.id) ?? null;
  }, [conversation, user]);

  const otherUser = useMemo(() => {
    if (!otherParticipantId) return null;
    return mockUsers.find((u) => u.id === otherParticipantId) ?? null;
  }, [otherParticipantId]);

  const typingUserId = isTypingUser(conversationId ?? "");

  useEffect(() => {
    if (conversationId && user?.id) {
      markSeen(conversationId, user.id);
    }
  }, [conversationId, user?.id, markSeen]);

  const pageTitle = otherUser?.displayName ?? "Conversation";
  const isVerified = otherUser?.verified ?? false;

  return (
    <div className="messages-page messages-page--fullscreen">
      <div className="messages-header">
        <button className="messages-header__back" onClick={() => navigate("/app/messages")} aria-label="Back to messages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="messages-header__avatar">
          <img src={otherUser?.photoUrl} alt={otherUser?.displayName} />
        </div>

        <div className="messages-header__info">
          <div className="messages-header__title-row">
            <span className="messages-header__name">{pageTitle}</span>
            {isVerified && <VerifiedBadge className="messages-header__verified" />}
          </div>
          <span className="messages-header__status">
            {typingUserId ? "typing..." : `@${otherUser?.username ?? "unknown"}`}
          </span>
        </div>

        <div className="messages-header__actions">
          <button className="messages-header__action" aria-label="More options">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="messages-thread">
        <ChatThread
          messages={messages}
          currentUserId={user?.id ?? ""}
          isTyping={!!typingUserId}
        />
      </div>

      {conversationId && user ? (
        <div className="messages-composer">
          <ChatInput conversationId={conversationId} senderId={user.id} />
        </div>
      ) : null}
    </div>
  );
}