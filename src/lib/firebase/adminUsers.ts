import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const USERS_COLLECTION = "users";

export async function setUserVerified(userId: string, verified: boolean) {
  if (!firestore) {
    throw new Error("Firebase Firestore is not configured.");
  }

  if (!userId) {
    throw new Error("A valid user id is required.");
  }

  await updateDoc(doc(firestore, USERS_COLLECTION, userId), {
    verified,
    updatedAt: new Date().toISOString(),
  });
}
