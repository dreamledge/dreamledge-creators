import { doc, setDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ReviewSessionModel } from "@/types/models";

export const REVIEW_SESSIONS_COLLECTION = "review_sessions";

export async function upsertReviewSession(session: ReviewSessionModel) {
  if (!db) return;
  await setDoc(doc(db, REVIEW_SESSIONS_COLLECTION, session.id), session, { merge: true });
}

export async function findOrCreateSession(userAId: string, userBId: string): Promise<ReviewSessionModel> {
  if (!db) {
    throw new Error("Firebase Firestore is not configured");
  }

  // Look for existing session between these two users (in either order)
  const sessionRef = collection(db, REVIEW_SESSIONS_COLLECTION);
  const q1 = query(
    sessionRef,
    where("creatorA", "==", userAId),
    where("creatorB", "==", userBId)
  );
  const q2 = query(
    sessionRef,
    where("creatorA", "==", userBId),
    where("creatorB", "==", userAId)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2)
  ]);

  // Check first query
  if (!snapshot1.empty) {
    const docSnap = snapshot1.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as ReviewSessionModel;
  }

  // Check second query
  if (!snapshot2.empty) {
    const docSnap = snapshot2.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as ReviewSessionModel;
  }

  // No existing session found, create a new one
  const now = new Date();
  const newSession: ReviewSessionModel = {
    id: `session-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
    creatorA: userAId,
    creatorB: userBId,
    creatorASubmission: null,
    creatorBSubmission: null,
    creatorAWatchProgress: {
      watchedMilliseconds: 0,
      hasMetMinimumWatchRequirement: false,
      lastPlaybackPosition: 0,
      watchStartedAt: null
    },
    creatorBWatchProgress: {
      watchedMilliseconds: 0,
      hasMetMinimumWatchRequirement: false,
      lastPlaybackPosition: 0,
      watchStartedAt: null
    },
    creatorAReviewForB: null,
    creatorBReviewForA: null,
    status: "waiting",
    selectionExpiresAt: null,
    scoringExpiresAt: null,
    watchingDeadlineAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  await upsertReviewSession(newSession);
  return newSession;
}

export function subscribeReviewSession(
  sessionId: string,
  onUpdate: (session: ReviewSessionModel | null) => void,
  onError: (error: Error) => void = console.error
) {
  if (!db) {
    onError(new Error("Firebase Firestore is not configured"));
    return () => {};
  }

  const sessionRef = doc(db, REVIEW_SESSIONS_COLLECTION, sessionId);
  return onSnapshot(sessionRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as ReviewSessionModel);
    } else {
      onUpdate(null);
    }
  }, onError);
}
