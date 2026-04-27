import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/app/providers/AuthProvider";
import { subscribeCreatorContent, subscribeProfile } from "@/lib/firebase/publicData";
import { getFirebaseMessaging, firebaseVapidKey } from "@/lib/firebase";
import type { ContentModel, UserModel } from "@/types/models";

const PWA_DOWNLOADED_KEY = "pwa_downloaded";
const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled";

export function MyProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<UserModel | null>(null);
  const [items, setItems] = useState<ContentModel[]>([]);
  const [installBtnText, setInstallBtnText] = useState("📲 Install App");
  const [notifyBtnText, setNotifyBtnText] = useState("🔔 Notify");
  const deferredPromptRef = useRef<any>(null);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  useEffect(() => {
    const downloaded = localStorage.getItem(PWA_DOWNLOADED_KEY);
    const notifications = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);

    if (downloaded) {
      setInstallBtnText("✅ Installed");
    }
    if (notifications) {
      setNotifyBtnText("🔔 Enabled");
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstallBtnText("✅ Installed");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(PWA_DOWNLOADED_KEY, "true");
        setInstallBtnText("✅ Installed");
      }
      deferredPromptRef.current = null;
    } else {
      setInstallBtnText("✅ Installed");
      localStorage.setItem(PWA_DOWNLOADED_KEY, "true");
    }
  };

  const handleNotify = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notifications blocked. Please enable in browser settings.");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (messaging) {
        const { getToken } = await import("firebase/messaging");
        const token = await getToken(messaging, { vapidKey: firebaseVapidKey });
        console.log("FCM Token for user:", token);
        
        localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
        setNotifyBtnText("🔔 Enabled");
      } else {
        console.warn("Firebase Messaging not supported");
        localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
        setNotifyBtnText("🔔 Enabled");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("Failed to enable notifications. Please try again.");
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setItems([]);
      return;
    }

    const unsubscribeProfile = subscribeProfile(user.id, setProfile);
    const unsubscribeContent = subscribeCreatorContent(user.id, setItems);

    return () => {
      unsubscribeProfile();
      unsubscribeContent();
    };
  }, [user?.id]);

  const fallbackCreator: UserModel | null = user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        photoUrl: user.photoUrl,
        bannerUrl: user.bannerUrl ?? "",
        bio: user.bio ?? "",
        categories: [],
        goals: [],
        socialLinks: user.socialLinks ?? {},
        totalPoints: 0,
        battleWins: 0,
        contestWins: 0,
        followerCount: 0,
        followingCount: (user.followingIds ?? []).length,
        followerIds: [],
        followingIds: user.followingIds ?? [],
        badges: [],
        verified: user.verified ?? false,
        rookie: false,
        matchmakingContentId: user.matchmakingContentId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  const creator = profile ?? fallbackCreator;
  const creatorsById = useMemo(() => {
    if (!creator) return new Map<string, UserModel>();
    return new Map<string, UserModel>([[creator.id, creator]]);
  }, [creator]);

  return (
    <div className="space-y-6">
      <div className="profile-action-bar">
        <div className="profile-action-bar-content">
          <span className="profile-action-bar-text">Get the full experience</span>
          <div className="profile-action-bar-buttons">
            <button className="profile-action-btn profile-action-install" onClick={handleInstall}>
              {installBtnText}
            </button>
            <button className="profile-action-btn profile-action-notify" onClick={handleNotify}>
              {notifyBtnText}
            </button>
          </div>
        </div>
      </div>
      {creator ? <ProfileCard creator={creator} isOwnProfile /> : null}
      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm text-zinc-400 hover:text-zinc-200 underline"
      >
        Sign out
      </button>
      <BadgeList badges={creator?.badges ?? []} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "posts" ? <ContentGrid items={items} creatorsById={creatorsById} /> : null}
    </div>
  );
}