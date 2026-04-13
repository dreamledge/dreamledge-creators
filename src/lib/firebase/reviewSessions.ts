import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ReviewSessionModel } from "@/types/models";

export const REVIEW_SESSIONS_COLLECTION = "review_sessions";

export async function upsertReviewSession(session: ReviewSessionModel) {
  if (!db) return;
  await setDoc(doc(db, REVIEW_SESSIONS_COLLECTION, session.id), session, { merge: true });
}
