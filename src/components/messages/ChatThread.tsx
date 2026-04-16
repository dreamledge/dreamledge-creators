import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { MessageModel } from "@/types/models";

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function ChatThread({ messages, currentUserId }: { messages: MessageModel[]; currentUserId: string }) {
  return (
    <div className="message-thread">
      {messages.map((message) => {
        const sender = mockUsers.find((user) => user.id === message.senderId);
        const isOutgoing = message.senderId === currentUserId;
        return (
          <div key={message.id} className={`message-thread__row ${isOutgoing ? "message-thread__row--outgoing" : "message-thread__row--incoming"}`}>
            <div className={`message-thread__bubble ${isOutgoing ? "message-thread__bubble--outgoing" : "message-thread__bubble--incoming"}`}>
              {!isOutgoing ? (
                <VerifiedLabel
                  text={sender?.displayName ?? "Someone"}
                  verified={sender?.verified}
                  className="message-thread__sender"
                  textClassName="message-thread__sender"
                  iconClassName="verified-label__icon--tiny"
                />
              ) : null}
              <p className="message-thread__text">{message.body}</p>
              <span className={`message-thread__meta ${isOutgoing ? "message-thread__meta--outgoing" : "message-thread__meta--incoming"}`}>
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
