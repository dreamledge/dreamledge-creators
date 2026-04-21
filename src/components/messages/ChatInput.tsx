import { useRef, useState, useEffect, useCallback } from "react";
import { useMessages, useMessageInputState } from "@/app/providers/MessagesProvider";

export function ChatInput({ conversationId, senderId }: { conversationId: string; senderId: string }) {
  const { sendMessage } = useMessages();
  const { setMyTyping } = useMessageInputState(conversationId);
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!draft.trim()) return;
    sendMessage({ conversationId, senderId, body: draft });
    setDraft("");
    setMyTyping(false, senderId);
  }, [draft, conversationId, senderId, sendMessage, setMyTyping]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (e.target.value) {
      setMyTyping(true, senderId);
    } else {
      setMyTyping(false, senderId);
    }
  }, [setMyTyping, senderId]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!draft) {
      setMyTyping(false, senderId);
    } else {
      timeout = setTimeout(() => {
        setMyTyping(false, senderId);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [draft, senderId, setMyTyping]);

  return (
    <div className={`dm-composer-shell ${isFocused ? "dm-composer-shell--focused" : ""}`}>
      <button className="dm-composer-add" type="button" aria-label="Add content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
        </svg>
      </button>

      <div className="dm-composer-input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="dm-composer-input"
          placeholder="Message..."
          value={draft}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        className="dm-composer-send"
        type="button"
        onClick={handleSend}
        disabled={!draft.trim()}
        aria-label="Send message"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15-2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
