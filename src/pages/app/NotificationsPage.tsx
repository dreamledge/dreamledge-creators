import { useNavigate } from "react-router-dom";
import { NotificationCard } from "@/components/cards/NotificationCard";
import { mockNotifications } from "@/lib/constants/mockData";

export function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="home-header">
        <button
          className="notification-back-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="home-header-text">
          <span>dreamledge</span>
          <span className="home-header-creators">notifications</span>
        </div>
        <div style={{ width: 32 }}></div>
      </div>
      <div className="notifications-list">
        {mockNotifications.map((item) => <NotificationCard key={item.id} notification={item} />)}
      </div>
    </div>
  );
}