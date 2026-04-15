import { useNavigate, useLocation } from "react-router-dom";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { FeedList, useFeedContext } from "@/components/feed/FeedList";
import { mockContent } from "@/lib/constants/mockData";
import type { FeedTab } from "@/types/models";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMuted, setIsMuted } = useFeedContext();

  const getCurrentTabFromParams = (): FeedTab => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["following", "trending", "new"].includes(tab)) {
      return tab as FeedTab;
    }
    return "for-you";
  };

  return (
    <div className="home-page-container">
      <div className="sticky-header">
        <div className="home-header">
          <button
            className="create-post-btn"
            onClick={() => navigate("/app/create")}
            title="Create Post"
          >
            <svg
              className="stroke-red-500 fill-none group-hover:fill-red-800"
              viewBox="0 0 24 24"
              height="50px"
              width="50px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeWidth="1.5"
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              ></path>
              <path strokeWidth="1.5" d="M8 12H16"></path>
              <path strokeWidth="1.5" d="M12 16V8"></path>
            </svg>
          </button>
          <div className="home-header-text">
            <span>dreamledge</span>
            <span className="home-header-creators">creators</span>
          </div>
          <button
            className="notification-btn"
            onClick={() => navigate("/app/notifications")}
            title="Notifications"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
        </div>
        <FeedTabs active={getCurrentTabFromParams()} onChange={() => {}} />
        <div className="volume-toggle-container">
          <span className="volume-label">
            <span className="volume-arrow">→</span>
            Volume {isMuted ? "off" : "on"} recommended
          </span>
          <label className="volume-switch">
            <input 
              type="checkbox" 
              checked={!isMuted} 
              onChange={(e) => setIsMuted(!e.target.checked)}
            />
            <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="volume-icon mute">
              <path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>
            </svg>
            <svg viewBox="0 0 448 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="volume-icon voice">
              <path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"/>
            </svg>
          </label>
        </div>
      </div>
      <FeedList items={mockContent} />
    </div>
  );
}