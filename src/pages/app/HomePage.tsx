import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { FeedList, FeedProvider } from "@/components/feed/FeedList";
import { CommentModalProvider, CommentModal } from "@/components/overlays/CommentModal";
import { getVisibleMockContent } from "@/lib/constants/mockData";
import type { FeedTab } from "@/types/models";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getCurrentTabFromParams = (): FeedTab => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["live-now", "following", "trending", "new"].includes(tab)) {
      return tab as FeedTab;
    }
    return "for-you";
  };

  const currentTab = getCurrentTabFromParams();
  const followingIds = user?.followingIds ?? [];
  const visibleContent = getVisibleMockContent();

  const feedItems = (() => {
    switch (currentTab) {
      case "live-now":
        return visibleContent.filter((item) => item.platform === "twitch" && item.status === "live");
      case "following":
        return visibleContent.filter((item) => followingIds.includes(item.creatorId));
      case "new":
        return [...visibleContent].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "trending":
        return [...visibleContent].sort((a, b) => (b.likeCount + b.commentCount + b.shareCount + b.saveCount) - (a.likeCount + a.commentCount + a.shareCount + a.saveCount));
      case "for-you":
      default:
        return visibleContent;
    }
  })();

  return (
    <CommentModalProvider>
    <FeedProvider>
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
          <FeedTabs active={currentTab} onChange={() => {}} />
        </div>
        <FeedList items={feedItems} />
      </div>
    </FeedProvider>
    <CommentModal />
    </CommentModalProvider>
  );
}
