import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockConversations, mockMessages } from "@/lib/constants/mockData";
import type { ConversationModel, MessageModel } from "@/types/models";

const MESSAGES_STORAGE_KEY = "dreamledge-creators-messages";

interface MessagesState {
  conversations: ConversationModel[];
  messages: MessageModel[];
}

interface MessagesContextValue extends MessagesState {
  sendMessage: (input: { conversationId: string; senderId: string; body: string }) => void;
  startConversation: (participantIds: string[]) => string;
}

const defaultState: MessagesState = {
  conversations: mockConversations,
  messages: mockMessages,
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

function getStoredMessagesState(): MessagesState {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<MessagesState>;
    if (!Array.isArray(parsed.conversations) || !Array.isArray(parsed.messages)) {
      return defaultState;
    }

    return {
      conversations: parsed.conversations,
      messages: parsed.messages,
    };
  } catch {
    return defaultState;
  }
}

function getConversationKey(participantIds: string[]) {
  return [...participantIds].sort().join("|");
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MessagesState>(() => getStoredMessagesState());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<MessagesContextValue>(() => ({
    ...state,
    startConversation: (participantIds) => {
      const normalizedParticipantIds = Array.from(new Set(participantIds));
      const existingConversation = state.conversations.find(
        (conversation) => getConversationKey(conversation.participantIds) === getConversationKey(normalizedParticipantIds),
      );

      if (existingConversation) {
        return existingConversation.id;
      }

      const createdAt = new Date().toISOString();
      const conversationId = `cv${Date.now()}`;

      setState((current) => ({
        ...current,
        conversations: [
          {
            id: conversationId,
            participantIds: normalizedParticipantIds,
            lastMessage: "",
            lastSenderId: undefined,
            lastMessageAt: createdAt,
            createdAt,
          },
          ...current.conversations,
        ],
      }));

      return conversationId;
    },
    sendMessage: ({ conversationId, senderId, body }) => {
      const trimmedBody = body.trim();
      if (!trimmedBody) return;

      const createdAt = new Date().toISOString();
      const nextMessage: MessageModel = {
        id: `m${Date.now()}`,
        conversationId,
        senderId,
        body: trimmedBody,
        messageType: "text",
        createdAt,
      };

      setState((current) => ({
        messages: [...current.messages, nextMessage],
        conversations: current.conversations
          .map((conversation) =>
            conversation.id === conversationId
                ? {
                    ...conversation,
                    lastMessage: trimmedBody,
                    lastSenderId: senderId,
                    lastMessageAt: createdAt,
                  }
                : conversation,
          )
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
      }));
    },
  }), [state]);

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) throw new Error("useMessages must be used within MessagesProvider");
  return context;
}
