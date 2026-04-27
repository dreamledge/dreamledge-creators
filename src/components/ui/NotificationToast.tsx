import { useEffect, useState } from "react";
import type { NotificationModel } from "@/types/models";

export interface ToastNotification extends NotificationModel {
  visible: boolean;
}

interface NotificationToastProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  index: number;
}

export function NotificationToast({ toast, onDismiss, index }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getMessage = () => {
    if (toast.message) return toast.message;
    switch (toast.type) {
      case "new follower":
        return "Someone followed you!";
      case "new comment":
        return "New comment on your content";
      case "new reply":
        return "New reply to your comment";
      case "new like":
        return "Someone liked your content";
      case "battle invite":
        return "You have a battle invitation";
      case "battle result":
        return "Battle results are in!";
      case "contest reminder":
        return "Contest reminder";
      case "contest result":
        return "Contest results announced";
      case "message received":
        return "New message received";
      case "crew invite":
        return "You have a crew invitation";
      case "admin broadcast":
        return toast.title || "Admin broadcast";
      default:
        return "New notification";
    }
  };

  return (
    <div
      className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      }`}
      style={{ top: index === 0 ? '80px' : `calc(80px + ${index * 92}px)` }}
    >
      <div className="h-[88px] bg-white dark:bg-zinc-900 shadow-lg border-b border-zinc-200 dark:border-zinc-700">
        <div className="h-full max-w-2xl mx-auto px-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-lg font-bold">D</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {toast.title || "Dreamledge"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {getMessage()}
            </p>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(toast.id), 300);
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}