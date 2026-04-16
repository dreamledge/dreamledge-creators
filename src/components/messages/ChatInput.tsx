import { useId, useMemo, useState } from "react";
import { useMessages } from "@/app/providers/MessagesProvider";

export function ChatInput({ conversationId, senderId }: { conversationId: string; senderId: string }) {
  const { sendMessage } = useMessages();
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputId = useId();

  const fileLabel = useMemo(() => {
    if (!selectedFile) return null;
    return selectedFile.name.length > 28 ? `${selectedFile.name.slice(0, 25)}...` : selectedFile.name;
  }, [selectedFile]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage({ conversationId, senderId, body: draft });
    setDraft("");
  };

  return (
    <div className="message-composer-shell">
      {selectedFile ? (
        <div className="message-composer-file-pill">
          <span className="message-composer-file-pill__label">Image selected</span>
          <span className="message-composer-file-pill__name">{fileLabel}</span>
          <button type="button" className="message-composer-file-pill__clear" onClick={() => setSelectedFile(null)}>
            Remove
          </button>
        </div>
      ) : null}
      <div className="message-composer">
        <div className="message-composer__upload">
          <label htmlFor={fileInputId} className="message-composer__upload-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337" aria-hidden="true">
              <circle strokeWidth="20" r="158.5" cy="168.5" cx="168.5"></circle>
              <path strokeLinecap="round" strokeWidth="25" d="M167.759 79V259"></path>
              <path strokeLinecap="round" strokeWidth="25" d="M79 167.138H259"></path>
            </svg>
            <span className="message-composer__tooltip">Add an image</span>
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            className="message-composer__file-input"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <input
          className="message-composer__input"
          placeholder="Message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button type="button" className="message-composer__send" onClick={handleSend} aria-label="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663" aria-hidden="true">
            <path d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
