import { useState } from "react";
import { useMessages } from "@/app/providers/MessagesProvider";
import { Button } from "@/components/ui/Button";

export function ChatInput({ conversationId, senderId }: { conversationId: string; senderId: string }) {
  const { sendMessage } = useMessages();
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage({ conversationId, senderId, body: draft });
    setDraft("");
  };

  return (
    <div className="flex gap-3 rounded-[32px] border border-white/10 bg-card/90 p-4">
      <input
        className="min-w-0 flex-1 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3"
        placeholder="Send a message, battle invite, or shared content"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSend();
          }
        }}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
}
