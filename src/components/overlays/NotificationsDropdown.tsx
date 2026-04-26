import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeNotifications, markNotificationRead } from "@/lib/firebase/notifications";
import { subscribePublicUsers } from "@/lib/firebase/publicData";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import type { NotificationModel, UserModel } from "@/types/models";

const getNotificationMessage = (notification: NotificationModel): string => {
  const type = notification.type;
  
  switch (type) {
    case "new follower":
      return `started following you`;
    case "new comment":
      return `commented on your ${notification.targetType || 'post'}`;
    case "new reply":
      return `replied to your comment`;
    case "new like":
      return `liked your ${notification.targetType || 'post'}`;
    case "battle invite":
      return `invited you to a battle`;
    case "battle result":
      return `Battle results are in - check who won!`;
    case "contest reminder":
      return `Contest "${notification.targetType}" is ending soon!`;
    case "contest result":
      return `Contest results are live - see how you placed!`;
    case "message received":
      return `sent you a message`;
    case "crew invite":
      return `invited you to join their crew`;
    default:
      return `interacted with your content`;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${weeks}w`;
};

interface NotificationsDropdownProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ userId, isOpen, onClose }: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !isOpen) return;
    const unsubNotifs = subscribeNotifications(userId, setNotifications);
    const unsubUsers = subscribePublicUsers(setUsers);
    return () => {
      unsubNotifs();
      unsubUsers();
    };
  }, [userId, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if the click was on the notification button itself to prevent immediate re-opening
        const target = event.target as Element;
        if (!target.closest('.notification-btn')) {
          onClose();
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const handleNotificationClick = (notification: NotificationModel) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    onClose();

    // Basic navigation logic based on type
    if (notification.type === "message received") {
      navigate(`/app/messages`); // Ideally navigate to specific conversation
    } else if (notification.type === "new follower") {
      navigate(`/app/profile/${notification.actorId}`);
    } else {
      // Default fallback
      navigate(`/app/notifications`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-dropdown-overlay" ref={dropdownRef}>
      <div className="notifications-dropdown-header flex justify-between items-center">
        <span>Notifications</span>
        <button onClick={onClose} className="p-1 hover:bg-surface-overlay rounded-full transition-colors" title="Close notifications">
          <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current text-text-secondary hover:text-text-primary">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
      
      {notifications.length === 0 ? (
        <div className="notifications-dropdown-empty">
          No recent notifications.
        </div>
      ) : (
        <div className="notifications-dropdown-content">
          {notifications.map((notification) => {
            const actor = usersById.get(notification.actorId);
            const message = getNotificationMessage(notification);
            const timeAgo = formatTimeAgo(notification.createdAt);
            
            return (
              <div 
                key={notification.id} 
                className={`notifications-dropdown-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <img 
                  src={actor?.photoUrl || DEFAULT_AVATAR_URL} 
                  alt={actor?.displayName || "User"} 
                  className="notifications-dropdown-avatar" 
                />
                
                <div className="notifications-dropdown-content">
                  <p className="notifications-dropdown-text">
                    <strong>{actor?.displayName || "Someone"}</strong> {message}
                  </p>
                  <span className="notifications-dropdown-time">{timeAgo}</span>
                </div>

                {!notification.read && <div className="notifications-dropdown-unread-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
