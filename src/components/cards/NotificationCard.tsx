import { Link } from "react-router-dom";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { NotificationModel } from "@/types/models";

const getNotificationMessage = (notification: NotificationModel): string => {
  const type = notification.type;
  
  switch (type) {
    case "new follower":
      return `started following you`;
    case "new comment":
      return `commented on your ${notification.targetType}`;
    case "new reply":
      return `replied to your comment`;
    case "new like":
      return `liked your ${notification.targetType}`;
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
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export function NotificationCard({ notification }: { notification: NotificationModel }) {
  const actor = mockUsers.find((user) => user.id === notification.actorId);
  const message = getNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);
  
  return (
    <div className={`notification-card ${notification.read ? "" : "notification-unread"}`}>
      <div className="notification-img">
        <img 
          src={actor?.photoUrl || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80"} 
          alt={actor?.displayName}
        />
      </div>
      <div className="notification-textBox">
        <div className="notification-textContent">
          <Link to={`/app/profile/${notification.actorId}`} className="notification-h1">
            <VerifiedLabel text={actor?.displayName || "Someone"} verified={actor?.verified} textClassName="notification-h1" iconClassName="verified-label__icon--tiny" />
          </Link>
          <span className="notification-span">{timeAgo}</span>
        </div>
        <p className="notification-p">{message}</p>
      </div>
    </div>
  );
}
