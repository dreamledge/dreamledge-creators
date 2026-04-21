import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { mockConversations, mockMessages } from "@/lib/constants/mockData";
import type { ConversationModel, MessageModel, MessageReaction, MessageStatus } from "@/types/models";

const MESSAGES_STORAGE_KEY = "dreamledge-creators-messages";

interface MessagesState {
  conversations: ConversationModel[];
  messages: MessageModel[];
}

interface MessagesContextValue extends MessagesState {
  sendMessage: (input: { conversationId: string; senderId: string; body: string }) => void;
  addReaction: (messageId: string, userId: string, reaction: MessageReaction) => void;
  removeReaction: (messageId: string, userId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  markSeen: (conversationId: string, userId: string) => void;
  startConversation: (participantIds: string[]) => string;
  getConversation: (conversationId: string) => ConversationModel | undefined;
  getMessages: (conversationId: string) => MessageModel[];
  getOtherParticipant: (conversationId: string, currentUserId: string) => string | null;
  isTypingUser: (conversationId: string) => string | null;
}

const defaultState: MessagesState = {
  conversations: mockConversations,
  messages: mockMessages.map((m) => ({
    ...m,
    status: "seen" as MessageStatus,
    reactions: {},
  })),
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

function migrateMessageToV2(msg: Partial<MessageModel>): MessageModel {
  return {
    id: msg.id ?? `m${Date.now()}`,
    conversationId: msg.conversationId ?? "",
    senderId: msg.senderId ?? "",
    body: msg.body ?? "",
    messageType: msg.messageType ?? "text",
    status: msg.status ?? "seen",
    reactions: msg.reactions ?? {},
    replyToId: msg.replyToId,
    createdAt: msg.createdAt ?? new Date().toISOString(),
  };
}

function migrateConversationToV2(conv: Partial<ConversationModel>): ConversationModel {
  return {
    id: conv.id ?? `cv${Date.now()}`,
    participantIds: conv.participantIds ?? [],
    lastMessage: conv.lastMessage ?? "",
    lastSenderId: conv.lastSenderId,
    lastMessageAt: conv.lastMessageAt ?? new Date().toISOString(),
    unreadCount: conv.unreadCount ?? 0,
    createdAt: conv.createdAt ?? new Date().toISOString(),
  };
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [state, setState] = useState<MessagesState>(() => {
    const stored = getStoredMessagesState();
    return {
      conversations: stored.conversations.map(migrateConversationToV2),
      messages: stored.messages.map(migrateMessageToV2),
    };
  });

  const isTypingUser = useCallback((conversationId: string) => {
    return typingUsers[conversationId] ?? null;
  }, [typingUsers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addReaction = useCallback((messageId: string, userId: string, reaction: MessageReaction) => {
    setState((current) => ({
      ...current,
      messages: current.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: { ...msg.reactions, [userId]: reaction } }
          : msg,
      ),
    }));
  }, []);

  const removeReaction = useCallback((messageId: string, userId: string) => {
    setState((current) => ({
      ...current,
      messages: current.messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        const { [userId]: _, ...restReactions } = msg.reactions;
        return { ...msg, reactions: restReactions };
      }),
    }));
  }, []);

  const setTyping = useCallback((conversationId: string, userId: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      if (isTyping) {
        return { ...prev, [conversationId]: userId };
      }
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, []);

  const markSeen = useCallback((conversationId: string, userId: string) => {
    setState((current) => ({
      ...current,
      messages: current.messages.map((msg) =>
        msg.conversationId === conversationId && msg.senderId !== userId
          ? { ...msg, status: "seen" as MessageStatus }
          : msg,
      ),
    }));
  }, []);

  const value = useMemo<MessagesContextValue>(() => ({
    ...state,
    addReaction,
    removeReaction,
    setTyping,
    markSeen,
    isTypingUser,
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
            unreadCount: 0,
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
        status: "sending",
        reactions: {},
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

      setTimeout(() => {
        setState((current) => ({
          ...current,
          messages: current.messages.map((msg) =>
            msg.id === nextMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        }));
      }, 300);

      setTimeout(() => {
        setState((current) => ({
          ...current,
          messages: current.messages.map((msg) =>
            msg.id === nextMessage.id ? { ...msg, status: "delivered" } : msg,
          ),
        }));
      }, 800);
    },
    getConversation: (conversationId) => state.conversations.find((c) => c.id === conversationId),
    getMessages: (conversationId) => state.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    getOtherParticipant: (conversationId, currentUserId) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv) return null;
      return conv.participantIds.find((id) => id !== currentUserId) ?? null;
    },
  }), [state, addReaction, removeReaction, setTyping, markSeen]);

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) throw new Error("useMessages must be used within MessagesProvider");
  return context;
}

/**
 * Hook to get typing state for a specific conversation
 * Returns the userId of the person typing, or null if no one is typing
 */
export function useTypingState(conversationId: string) {
  const { setTyping } = useMessages();
  const [myTyping, setMyTyping] = useState(false);

  const updateTyping = useCallback((isTyping: boolean, userId?: string) => {
    if (userId) {
      setTyping(conversationId, userId, isTyping);
    }
    setMyTyping(isTyping);
  }, [conversationId, setTyping]);

  return { myTyping, setMyTyping: updateTyping };
}

export { useTypingState as useMessageInputState };