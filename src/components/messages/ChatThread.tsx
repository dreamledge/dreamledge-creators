import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { mockUsers } from "@/lib/constants/mockData";
import type { MessageModel, MessageReaction } from "@/types/models";
import { useMessages } from "@/app/providers/MessagesProvider";

const REACTIONS: MessageReaction[] = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface MessageGroup {
  id: string;
  senderId: string;
  messages: MessageModel[];
  showAvatar: boolean;
}

interface TypingIndicatorProps {
  user: { displayName: string; photoUrl: string };
}

function TypingIndicator({ user }: TypingIndicatorProps) {
  return (
    <div className="dm-typing">
      <img src={user.photoUrl} alt={user.displayName} className="dm-typing__avatar" />
      <div className="dm-typing__bubble">
        <span className="dm-typing__dot"></span>
        <span className="dm-typing__dot"></span>
        <span className="dm-typing__dot"></span>
      </div>
    </div>
  );
}

interface ReactionPickerProps {
  onSelect: (reaction: MessageReaction) => void;
  onClose: () => void;
}

function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  return (
    <div className="dm-reaction-picker">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction}
          className="dm-reaction-picker__btn"
          onClick={() => onSelect(reaction)}
        >
          {reaction}
        </button>
      ))}
      <button className="dm-reaction-picker__close" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ChatThread({
  messages,
  currentUserId,
  isTyping,
}: {
  messages: MessageModel[];
  currentUserId: string;
  isTyping?: boolean;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [lockedToBottom, setLockedToBottom] = useState(true);

  const { addReaction, removeReaction, getOtherParticipant } = useMessages();

  const otherParticipantId = useMemo(() => {
    if (!messages.length) return null;
    return getOtherParticipant(messages[0].conversationId, currentUserId);
  }, [messages, currentUserId, getOtherParticipant]);

  const typingUser = useMemo(() => {
    if (!otherParticipantId) return null;
    return mockUsers.find((u) => u.id === otherParticipantId) ?? null;
  }, [otherParticipantId]);

  const scrollToBottom = useCallback(() => {
    if (!threadRef.current) return;
    requestAnimationFrame(() => {
      threadRef.current!.scrollTop = threadRef.current!.scrollHeight;
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!threadRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = threadRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 50;
    setLockedToBottom(isNearBottom);
  }, []);

  useEffect(() => {
    if (!threadRef.current) return;

    const observer = new MutationObserver(handleScroll);
    observer.observe(threadRef.current, { childList: true, subtree: false });

    return () => observer.disconnect();
  }, [handleScroll]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;
      if (lockedToBottom) {
        scrollToBottom();
      }
    } else if (messages.length === 0) {
      scrollToBottom();
    }
  }, [messages.length, lockedToBottom, scrollToBottom]);

  useEffect(() => {
    if (isTyping && lockedToBottom) {
      scrollToBottom();
    }
  }, [isTyping, lockedToBottom, scrollToBottom]);

  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((msg) => {
      const prevMsg = currentGroup?.messages[currentGroup.messages.length - 1];
      const timeGap = prevMsg
        ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()
        : Infinity;
      const isSameSender = prevMsg?.senderId === msg.senderId;
      const shouldGroup = isSameSender && timeGap < 60000;

      if (shouldGroup && currentGroup) {
        currentGroup.messages.push(msg);
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          id: msg.id,
          senderId: msg.senderId,
          messages: [msg],
          showAvatar: !prevMsg || !isSameSender,
        };
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  const handleReaction = (messageId: string, reaction: MessageReaction) => {
    const existingReaction = messages.find((m) => m.id === messageId)?.reactions[currentUserId];
    if (existingReaction === reaction) {
      removeReaction(messageId, currentUserId);
    } else {
      addReaction(messageId, currentUserId, reaction);
    }
    setShowReactionPicker(null);
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sending":
        return <span className="dm-status dm-status--sending">○</span>;
      case "sent":
        return <span className="dm-status dm-status--sent">✓</span>;
      case "delivered":
        return <span className="dm-status dm-status--delivered">✓✓</span>;
      case "seen":
        return <span className="dm-status dm-status--seen">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div ref={threadRef} className="dm-thread-list" onScroll={handleScroll}>
      {groupedMessages.map((group) => {
        const isOutgoing = group.senderId === currentUserId;
        const sender = mockUsers.find((u) => u.id === group.senderId);

        return (
          <div
            key={group.id}
            className={`dm-message-group ${
              isOutgoing ? "dm-message-group--outgoing" : "dm-message-group--incoming"
            }`}
          >
            {!isOutgoing && group.showAvatar && (
              <img
                src={sender?.photoUrl}
                alt={sender?.displayName}
                className="dm-message-avatar"
              />
            )}

            <div className="dm-message-group__content">
              {group.messages.map((msg) => {
                const reactions = Object.entries(msg.reactions);
                const hasReaction = reactions.length > 0;

                return (
                  <div
                    key={msg.id}
                    className={`dm-bubble ${isOutgoing ? "dm-bubble--outgoing" : "dm-bubble--incoming"}`}
                    onDoubleClick={() => handleReaction(msg.id, "❤️")}
                  >
                    <p className="dm-bubble__text">{msg.body}</p>

                    <div className="dm-bubble__meta">
                      <span className="dm-bubble__time">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isOutgoing && getMessageStatus(msg.status)}
                    </div>

                    {hasReaction && (
                      <div className="dm-bubble__reactions">
                        {reactions.map(([, reaction]) => (
                          <span key={reaction} className="dm-bubble__reaction">
                            {reaction}
                          </span>
                        ))}
                      </div>
                    )}

                    {showReactionPicker === msg.id && (
                      <ReactionPicker
                        onSelect={(r) => handleReaction(msg.id, r)}
                        onClose={() => setShowReactionPicker(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isTyping && typingUser && <TypingIndicator user={typingUser} />}
    </div>
  );
}