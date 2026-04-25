import type { DocumentData } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestore } from "./index";

const WAITING_QUEUE_COLLECTION = "waitingQueue";

export async function joinWaitingQueue(userId: string): Promise<string | null> {
  if (!firestore) return null;
  
  try {
    const q = collection(firestore, WAITING_QUEUE_COLLECTION);
    const snapshot = await getDocs(q);

    let hasSelfEntry = false;
    const selfEntries = [] as typeof snapshot.docs;
    let opponentDoc: (typeof snapshot.docs)[number] | null = null;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as DocumentData;
      if (data.userId === userId) {
        hasSelfEntry = true;
        selfEntries.push(docSnapshot);
        continue;
      }

      if (!opponentDoc) opponentDoc = docSnapshot;
    }

    // If we found an opponent and we were not queued yet, add ourselves so the opponent can detect us too.
    if (opponentDoc && !hasSelfEntry) {
      await addDoc(collection(firestore, WAITING_QUEUE_COLLECTION), {
        userId,
        joinedAt: serverTimestamp(),
      });
      return (opponentDoc.data() as DocumentData).userId as string;
    }

    // If we found an opponent and we were already queued, complete the handshake and clean both queue entries.
    if (opponentDoc && hasSelfEntry) {
      for (const selfEntry of selfEntries) {
        await deleteDoc(selfEntry.ref);
      }
      await deleteDoc(opponentDoc.ref);
      return (opponentDoc.data() as DocumentData).userId as string;
    }

    // No opponent yet, ensure we are queued once.
    if (!hasSelfEntry) {
      await addDoc(collection(firestore, WAITING_QUEUE_COLLECTION), {
        userId,
        joinedAt: serverTimestamp(),
      });
    }

    return null;
  } catch (error) {
    console.error("Error joining queue:", error);
    return null;
  }
}

export async function leaveWaitingQueue(userId: string): Promise<void> {
  if (!firestore) return;
  if (!userId) return;
  
  try {
    // Remove only current user's entries (in case of duplicates)
    const q = query(collection(firestore, WAITING_QUEUE_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
    }
  } catch (error) {
    console.error("Error leaving queue:", error);
  }
}

export function startMatchmaking(
  userId: string,
  onOpponentFound: (opponentId: string) => void,
  timeoutMs: number = 30000
): () => void {
  if (!firestore) {
    // Return a cleanup function that does nothing
    return () => {};
  }

  let unsubscribe = () => {};
  let cancelled = false;

  void (async () => {
    await leaveWaitingQueue(userId);
    const immediateOpponent = await joinWaitingQueue(userId);
    if (cancelled) return;

    if (immediateOpponent) {
      onOpponentFound(immediateOpponent);
      return;
    }

    unsubscribe = subscribeWaitingQueue(
      userId,
      onOpponentFound,
      () => {},
      timeoutMs,
    );
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export function subscribeWaitingQueue(
  userId: string,
  onOpponentFound: (opponentId: string) => void,
  onTimeout: () => void,
  timeoutMs: number = 30000
): () => void {
  if (!firestore) {
    setTimeout(onTimeout, timeoutMs);
    return () => {};
  }
  
  const q = collection(firestore, WAITING_QUEUE_COLLECTION);
  
  let timedOut = false;
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (timedOut) return;
    
    // Check if there's anyone else in queue besides us
    let opponentId: string | null = null;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as DocumentData;
      if (data.userId !== userId) {
        opponentId = data.userId as string;
        break;
      }
    }
    
    if (opponentId) {
      timedOut = true;
      unsubscribe();
      
      // Try to match with the opponent
      const matchedOpponent = await joinWaitingQueue(userId);
      if (matchedOpponent) {
        onOpponentFound(matchedOpponent);
      } else {
        // This shouldn't happen in theory, but handle just in case
        onTimeout();
      }
    }
  });
  
  const timeoutId = setTimeout(() => {
    if (!timedOut) {
      timedOut = true;
      unsubscribe();
      onTimeout();
    }
  }, timeoutMs);
  
  return () => {
    clearTimeout(timeoutId);
    if (!timedOut) {
      unsubscribe();
    }
  };
}
