import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { NotificationModel } from "@/types/models";

const NOTIFICATIONS_COLLECTION = "notifications";

function mapNotificationDoc(id: string, data: any): NotificationModel {
  return {
    id,
    userId: data.userId || "",
    type: data.type || "unknown",
    actorId: data.actorId || "",
    targetId: data.targetId || "",
    targetType: data.targetType || "",
    read: Boolean(data.read),
    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
  };
}

export function subscribeNotifications(userId: string, onData: (notifications: NotificationModel[]) => void, onError?: (error: Error) => void) {
  if (!firestore || !userId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(firestore, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => mapNotificationDoc(doc.id, doc.data()));
      // Sort by descending createdAt since indexing locally is sometimes easier
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(notifications);
    },
    (error) => {
      onData([]);
      if (onError) onError(error);
    }
  );
}

export async function markNotificationRead(notificationId: string) {
  if (!firestore) return;
  try {
    const docRef = doc(firestore, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    console.error("Failed to mark notification as read", err);
  }
}
