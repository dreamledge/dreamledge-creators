import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { NotificationModel, NotificationType } from "@/types/models";

const NOTIFICATIONS_COLLECTION = "notifications";
const USERS_COLLECTION = "users";

function mapNotificationDoc(id: string, data: any): NotificationModel {
  return {
    id,
    userId: data.userId || "",
    type: data.type || "unknown",
    actorId: data.actorId || "",
    targetId: data.targetId || "",
    targetType: data.targetType || "",
    title: data.title || undefined,
    message: data.message || undefined,
    read: Boolean(data.read),
    toastShown: Boolean(data.toastShown),
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

export async function markToastShown(notificationId: string) {
  if (!firestore) return;
  try {
    const docRef = doc(firestore, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { toastShown: true });
  } catch (err) {
    console.error("Failed to mark toast as shown", err);
  }
}

export async function sendAdminBroadcast(title: string, message: string) {
  if (!firestore) {
    console.error("Firestore not initialized");
    return;
  }

  try {
    const usersSnapshot = await getDocs(query(collection(firestore, USERS_COLLECTION)));
    const batch: Promise<any>[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.fcmToken || userData.notificationsEnabled !== false) {
        const notificationData = {
          userId: userDoc.id,
          type: "admin broadcast" as NotificationType,
          actorId: "system",
          targetId: "",
          targetType: "",
          title,
          message,
          read: false,
          toastShown: false,
          createdAt: new Date(),
        };
        batch.push(addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), notificationData));
      }
    }

    await Promise.all(batch);
    console.log(`Admin broadcast sent to ${batch.length} users`);
  } catch (err) {
    console.error("Failed to send admin broadcast", err);
    throw err;
  }
}
