import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { ConversationList } from "@/components/messages/ConversationList";
import { Button } from "@/components/ui/Button";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockUsers } from "@/lib/constants/mockData";

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, startConversation } = useMessages();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const visibleConversations = conversations.filter((conversation) => conversation.participantIds.includes(user?.id ?? ""));
  const availableCreators = useMemo(
    () => mockUsers.filter((creator) => creator.id !== user?.id),
    [user?.id],
  );

  const handleStartConversation = (targetUserId: string) => {
    if (!user) return;
    const conversationId = startConversation([user.id, targetUserId]);
    setIsComposerOpen(false);
    navigate(`/app/messages/${conversationId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader eyebrow="Messages" title="Direct creator conversations" />
        <Button onClick={() => setIsComposerOpen((current) => !current)}>{isComposerOpen ? "Close" : "New Message"}</Button>
      </div>
      {isComposerOpen ? (
        <div className="bubble-card rounded-[34px] p-5">
          <p className="text-sm font-semibold text-text-primary">Start a new conversation</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {availableCreators.map((creator) => (
              <button
                key={creator.id}
                type="button"
                className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/8"
                onClick={() => handleStartConversation(creator.id)}
              >
                <img src={creator.photoUrl} alt={creator.displayName} className="h-11 w-11 rounded-[22px] object-cover" />
                <div className="min-w-0">
                  <VerifiedLabel
                    text={creator.displayName}
                    verified={creator.verified}
                    className="truncate text-sm font-semibold text-text-primary"
                    textClassName="truncate text-sm font-semibold text-text-primary"
                    iconClassName="verified-label__icon--tiny"
                  />
                  <p className="truncate text-xs text-text-secondary">@{creator.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <ConversationList items={visibleConversations} currentUserId={user?.id ?? "u1"} />
    </div>
  );
}
