import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { subscribePublicUsers } from "@/lib/firebase/publicData";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";
import { ChatInput } from "@/components/messages/ChatInput";
import { ChatThread } from "@/components/messages/ChatThread";
import type { UserModel } from "@/types/models";

const SOCIAL_ROOM_RETURN_KEY = "dreamledge-social-room-return";

export function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getConversation, getMessages, markSeen, isTypingUser } = useMessages();
  const [allUsers, setAllUsers] = useState<UserModel[]>([]);

  useEffect(() => {
    const unsub = subscribePublicUsers(setAllUsers);
    return () => unsub();
  }, []);

  const conversation = getConversation(conversationId ?? "");
  const messages = getMessages(conversationId ?? "");

  const otherParticipantId = useMemo(() => {
    if (!conversation || !user) return null;
    return conversation.participantIds.find((id) => id !== user.id) ?? null;
  }, [conversation, user]);

  const otherUser = useMemo(() => {
    if (!otherParticipantId) return null;
    return allUsers.find((u) => u.id === otherParticipantId) ?? null;
  }, [otherParticipantId, allUsers]);

  const typingUserId = isTypingUser(conversationId ?? "");

  useEffect(() => {
    if (conversationId && user?.id) {
      markSeen(conversationId, user.id);
    }
  }, [conversationId, user?.id, markSeen]);

  const pageTitle = otherUser?.displayName ?? "Conversation";
  const isVerified = otherUser?.verified ?? false;
  const returnState = location.state as { returnToPath?: string; returnToVoiceRoomId?: string; returnToTab?: string } | null;

  const getStoredReturnState = () => {
    try {
      const raw = window.sessionStorage.getItem(SOCIAL_ROOM_RETURN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { returnToPath?: string; returnToVoiceRoomId?: string; returnToTab?: string };
      return parsed;
    } catch {
      return null;
    }
  };

  const clearStoredReturnState = () => {
    try {
      window.sessionStorage.removeItem(SOCIAL_ROOM_RETURN_KEY);
    } catch {
      // Ignore storage cleanup failures
    }
  };

  const handleBack = () => {
    const effectiveReturnState = returnState?.returnToVoiceRoomId ? returnState : getStoredReturnState();

    if (effectiveReturnState?.returnToVoiceRoomId) {
      navigate(effectiveReturnState.returnToPath ?? "/app/messages", {
        state: {
          restoreVoiceRoomId: effectiveReturnState.returnToVoiceRoomId,
          restoreTab: effectiveReturnState.returnToTab ?? "voice-chat",
        },
      });
      clearStoredReturnState();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/app/messages");
  };

  return (
    <div className="messages-page messages-page--fullscreen">
      <div className="messages-header">
        <button type="button" className="messages-header__back" onClick={handleBack} aria-label="Back to messages">
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
          allUsers={allUsers}
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
