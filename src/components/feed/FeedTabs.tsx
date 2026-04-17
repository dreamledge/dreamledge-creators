import { useNavigate, useLocation } from "react-router-dom";
import type { FeedTab } from "@/types/models";

const tabs: { key: FeedTab; label: string; url?: string }[] = [
  { key: "for-you", label: "For You", url: "/app/home" },
  { key: "live-now", label: "Live Now", url: "/app/home?tab=live-now" },
  { key: "following", label: "Following", url: "/app/home?tab=following" },
  { key: "trending", label: "Trending", url: "/app/home?tab=trending" },
  { key: "new", label: "New", url: "/app/home?tab=new" },
];

export function FeedTabs({ active, onChange }: { active: FeedTab; onChange: (tab: FeedTab) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentTabFromParams = (): FeedTab => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["live-now", "following", "trending", "new"].includes(tab)) {
      return tab as FeedTab;
    }
    return "for-you";
  };

  const currentTab = getCurrentTabFromParams();

  const handleClick = (tab: { key: FeedTab; label: string; url?: string }) => {
    if (tab.url) {
      navigate(tab.url);
    }
    onChange(tab.key);
  };

  const isActive = (tabKey: FeedTab): boolean => {
    if (tabKey === "contests" || tabKey === "battles") {
      return active === tabKey;
    }
    return currentTab === tabKey;
  };

  const getIcon = (tabKey: FeedTab) => {
    switch (tabKey) {
      case "for-you":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        );
      case "following":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
      case "live-now":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
            <path d="M6 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4.5L9 20v-4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2.5 4.5a1.5 1.5 0 0 0 0 3h.5v.5a1.5 1.5 0 0 0 3 0v-.5h.5a1.5 1.5 0 0 0 0-3H12V8a1.5 1.5 0 0 0-3 0v.5h-.5zm8-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
          </svg>
        );
      case "trending":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
          </svg>
        );
      case "new":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="feed-tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleClick(tab)}
          className={`feed-tab ${isActive(tab.key) ? "feed-tab-active" : "feed-tab-inactive"}`}
        >
          <span className="feed-tab-icon">{getIcon(tab.key)}</span>
          <span className="feed-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
