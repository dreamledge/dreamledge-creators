import type { DocumentData } from "firebase/firestore";
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "./index";

const WAITING_QUEUE_COLLECTION = "waitingQueue";
const MATCH_SESSIONS_COLLECTION = "matchSessions";

function getFirestoreRef() {
  if (!firestore) throw new Error("Firestore not initialized");
  return firestore;
}

export async function joinWaitingQueue(userId: string): Promise<{ matched: boolean; opponentId?: string; sessionId?: string }> {
  const fs = getFirestoreRef();
  
  try {
    const result = await runTransaction(fs, async (transaction) => {
      const q = collection(fs, WAITING_QUEUE_COLLECTION);
      const snapshot = await getDocs(q);
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        if (data.userId !== userId) {
          const opponentId = data.userId as string;
          
          transaction.delete(doc(fs, WAITING_QUEUE_COLLECTION, docSnapshot.id));
          
          const sessionRef = doc(collection(fs, MATCH_SESSIONS_COLLECTION));
          transaction.set(sessionRef, {
            sessionId: sessionRef.id,
            userAId: userId,
            userBId: opponentId,
            userAReviews: [],
            userBReviews: [],
            userASubmitted: false,
            userBSubmitted: false,
            matched: true,
            createdAt: serverTimestamp(),
          });
          
          return { matched: true, opponentId, sessionId: sessionRef.id };
        }
      }
      
      const queueRef = doc(collection(fs, WAITING_QUEUE_COLLECTION));
      transaction.set(queueRef, { userId, joinedAt: serverTimestamp() });
      
      return { matched: false };
    });
    
    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    return { matched: false };
  }
}

export async function leaveWaitingQueue(userId?: string): Promise<void> {
  const fs = getFirestoreRef();
  
  try {
    await runTransaction(fs, async (transaction) => {
      const q = collection(fs, WAITING_QUEUE_COLLECTION);
      const snapshot = await getDocs(q);
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        if (!userId || data.userId === userId) {
          transaction.delete(doc(fs, WAITING_QUEUE_COLLECTION, docSnapshot.id));
        }
      }
    });
  } catch (error) {
    console.error("Error leaving queue:", error);
  }
}

export function subscribeToMatchSession(
  sessionId: string,
  onMatch: (result: { matched: boolean; opponentId?: string; sessionId?: string }) => void,
  timeoutMs: number = 30000
): () => void {
  const fs = getFirestoreRef();
  
  const sessionRef = doc(fs, MATCH_SESSIONS_COLLECTION, sessionId);
  
  const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    
    const data = snapshot.data() as DocumentData;
    if (!data.matched) return;
    
    const opponentId = data.userAId === sessionId ? data.userBId : data.userAId;
    onMatch({ matched: true, opponentId, sessionId });
  });
  
  const timeoutId = setTimeout(() => {
    unsubscribe();
    onMatch({ matched: false });
  }, timeoutMs);

  return () => {
    clearTimeout(timeoutId);
    unsubscribe();
  };
}

export async function startMatchmaking(
  userId: string,
  onMatch: (result: { matched: boolean; opponentId?: string; sessionId?: string }) => void,
  timeoutMs: number = 30000
): Promise<() => void> {
  let resolved = false;
  let matchUnsubscribe: (() => void) | null = null;
  let cleanupTimeout: number | null = null;
  
  const cleanup = () => {
    if (!resolved) {
      resolved = true;
      if (matchUnsubscribe) matchUnsubscribe();
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
    }
  };
  
  const initialResult = await joinWaitingQueue(userId);
  
  if (initialResult.matched && initialResult.opponentId && initialResult.sessionId) {
    resolved = true;
    onMatch({ matched: true, opponentId: initialResult.opponentId, sessionId: initialResult.sessionId });
    return cleanup;
  }
  
  matchUnsubscribe = subscribeToMatchSession(userId, (result: { matched: boolean; opponentId?: string; sessionId?: string }) => {
    cleanup();
    if (result.matched && result.opponentId) {
      onMatch({ matched: true, opponentId: result.opponentId, sessionId: result.sessionId });
    }
  }, timeoutMs);
  
  cleanupTimeout = window.setTimeout(() => {
    cleanup();
    onMatch({ matched: false });
  }, timeoutMs);
  
  return cleanup;
}