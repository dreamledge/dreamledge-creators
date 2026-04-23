import type { FirestoreDataConverter } from "firebase/firestore";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./index";

const MATCHMAKING_COLLECTION = "matchmaking";

export interface MatchmakingEntry {
  userId: string;
  joinedAt: unknown;
}

const matchmakingConverter: FirestoreDataConverter<MatchmakingEntry> = {
  toFirestore(data: MatchmakingEntry): Omit<MatchmakingEntry, "joinedAt"> & { joinedAt: unknown } {
    return { userId: data.userId, joinedAt: serverTimestamp() };
  },
  fromFirestore(snapshot): MatchmakingEntry {
    const data = snapshot.data();
    return { userId: data.userId, joinedAt: data.joinedAt };
  },
};

export async function joinMatchmaking(userId: string): Promise<string | null> {
  if (!firestore) return null;
  
  const docRef = await addDoc(
    collection(firestore, MATCHMAKING_COLLECTION).withConverter(matchmakingConverter),
    { userId, joinedAt: serverTimestamp() }
  );
  return docRef.id;
}

export async function leaveMatchmaking(entryId: string): Promise<void> {
  if (!firestore || !entryId) return;
  await deleteDoc(doc(firestore, MATCHMAKING_COLLECTION, entryId));
}

export async function findAndClaimMatchmakingOpponent(excludeUserId: string): Promise<string | null> {
  if (!firestore) return null;
  
  const q = query(
    collection(firestore, MATCHMAKING_COLLECTION).withConverter(matchmakingConverter),
    where("userId", "!=", excludeUserId)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const opponentDoc = snapshot.docs[0];
  const opponentId = opponentDoc.data().userId;
  
  await deleteDoc(doc(firestore, MATCHMAKING_COLLECTION, opponentDoc.id));
  
  return opponentId;
}

export function subscribeMatchmaking(
  excludeUserId: string,
  onMatch: (opponentId: string) => void,
  onTimeout: () => void,
  timeoutMs: number = 60000
): () => void {
  if (!firestore) {
    setTimeout(onTimeout, timeoutMs);
    return () => {};
  }
  
  const q = query(
    collection(firestore, MATCHMAKING_COLLECTION).withConverter(matchmakingConverter),
    where("userId", "!=", excludeUserId)
  );

  const unsubscribeFn = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const opponentDoc = snapshot.docs[0];
      const opponentId = opponentDoc.data().userId;
      onMatch(opponentId);
    }
  });

  const timeoutId = setTimeout(() => {
    unsubscribeFn();
    onTimeout();
  }, timeoutMs);

  return () => {
    clearTimeout(timeoutId);
    unsubscribeFn();
  };
}