import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { FeedList, FeedProvider, useFeedContext } from "@/components/feed/FeedList";
import { CommentModalProvider, CommentModal } from "@/components/overlays/CommentModal";
import { mockContent, mockUsers } from "@/lib/constants/mockData";
import type { FeedTab, UserModel } from "@/types/models";

function resolveFeedUser(user: { id: string; username: string; email: string; followingIds?: string[] } | null): UserModel | null {
  if (!user) return null;

  const matchedUser = (
    mockUsers.find((entry) => entry.id === user.id) ??
    mockUsers.find((entry) => entry.username === user.username) ??
    mockUsers.find((entry) => entry.email === user.email) ??
    null
  );

  if (!matchedUser) return null;

  return {
    ...matchedUser,
    followingIds: user.followingIds ?? matchedUser.followingIds,
    followingCount: (user.followingIds ?? matchedUser.followingIds).length,
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getCurrentTabFromParams = (): FeedTab => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["following", "trending", "new"].includes(tab)) {
      return tab as FeedTab;
    }
    return "for-you";
  };

  const currentTab = getCurrentTabFromParams();
  const currentUser = resolveFeedUser(user);
  const followingIds = currentUser?.followingIds ?? [];

  const feedItems = (() => {
    switch (currentTab) {
      case "following":
        return mockContent.filter((item) => followingIds.includes(item.creatorId));
      case "new":
        return [...mockContent].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "trending":
        return [...mockContent].sort((a, b) => (b.likeCount + b.commentCount + b.shareCount + b.saveCount) - (a.likeCount + a.commentCount + a.shareCount + a.saveCount));
      case "for-you":
      default:
        return mockContent;
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
          <HomeVolumeToggle />
        </div>
        <FeedList items={feedItems} />
      </div>
    </FeedProvider>
    <CommentModal />
    </CommentModalProvider>
  );
}

function HomeVolumeToggle() {
  const { isMuted, setIsMuted } = useFeedContext();

  return (
    <div className="volume-toggle-wrapper">
      <span className="volume-toggle-label">videos start muted for autoplay</span>
      <input
        type="checkbox"
        id="volumeCheckbox"
        checked={!isMuted}
        onChange={(e) => setIsMuted(!e.target.checked)}
        className="volume-checkbox"
      />
      <label htmlFor="volumeCheckbox" className="volume-toggle-switch">
        <div className="volume-speaker">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 75 75">
            <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" stroke="#fff" strokeWidth="5" strokeLinejoin="round" fill="#fff"></path>
            <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"></path>
          </svg>
        </div>
        <div className="volume-mute-speaker">
          <svg version="1.0" viewBox="0 0 75 75" stroke="#fff" strokeWidth="5">
            <path d="m39,14-17,15H6V48H22l17,15z" fill="#fff" strokeLinejoin="round"></path>
            <path d="m49,26 20,24m0-24-20,24" fill="#fff" strokeLinecap="round"></path>
          </svg>
        </div>
      </label>
    </div>
  );
}
