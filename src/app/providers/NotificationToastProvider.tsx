import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { doc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseMessaging, firebaseVapidKey, firestore } from "@/lib/firebase";
import { markToastShown } from "@/lib/firebase/notifications";
import { useAuth } from "@/app/providers/AuthProvider";
import { NotificationToast, type ToastNotification } from "@/components/ui/NotificationToast";

interface ToastContextValue {
  showToast: (notification: Omit<ToastNotification, "visible">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within NotificationToastProvider");
  }
  return context;
}

interface NotificationToastProviderProps {
  children: ReactNode;
}

export function NotificationToastProvider({ children }: NotificationToastProviderProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { user } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const showToast = useCallback(async (notification: Omit<ToastNotification, "visible">) => {
    if (shownNotificationsRef.current.has(notification.id)) {
      return;
    }

    shownNotificationsRef.current.add(notification.id);
    
    if (firestore && notification.id && !notification.id.startsWith("fcm-")) {
      await markToastShown(notification.id);
    }
    
    const id = notification.id || `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = { ...notification, id, visible: true };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user?.id || !firestore) {
      if (!user?.id) {
        shownNotificationsRef.current.clear();
        initialLoadRef.current = true;
      }
      return;
    }

    shownNotificationsRef.current.clear();
    initialLoadRef.current = true;

    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", user.id)
    );

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docChanges();
      
      for (const change of notifications) {
        if (change.type === "added") {
          if (initialLoadRef.current) {
            continue;
          }
          
          const data = change.doc.data();
          showToast({
            id: change.doc.id,
            userId: data.userId || "",
            type: data.type || "unknown",
            actorId: data.actorId || "",
            targetId: data.targetId || "",
            targetType: data.targetType || "",
            title: data.title,
            message: data.message,
            read: Boolean(data.read),
            toastShown: Boolean(data.toastShown),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          });
        }
      }
      
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, showToast]);

  useEffect(() => {
    let messaging: Messaging | null = null;

    const setupMessaging = async () => {
      try {
        messaging = await getFirebaseMessaging();
        if (!messaging) return;

        onMessage(messaging, (payload) => {
          console.log("Foreground FCM message received:", payload);
          const notification = payload.notification;
          if (notification) {
            showToast({
              id: `fcm-${Date.now()}`,
              userId: user?.id || "",
              type: "admin broadcast",
              actorId: "system",
              targetId: "",
              targetType: "",
              title: notification.title,
              message: notification.body,
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        });

        if (user?.id) {
          const permission = await Notification.permission;
          if (permission === "granted") {
            const token = await getToken(messaging, { vapidKey: firebaseVapidKey });
            if (token) {
              const { firestore } = await import("@/lib/firebase");
              if (firestore) {
                await updateDoc(doc(firestore, "users", user.id), {
                  fcmToken: token,
                  notificationsEnabled: true,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to setup FCM:", err);
      }
    };

    if (user?.id) {
      setupMessaging();
    }
  }, [user?.id, showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast, index) => (
        <NotificationToast key={toast.id} toast={toast} onDismiss={dismissToast} index={index} />
      ))}
    </ToastContext.Provider>
  );
}