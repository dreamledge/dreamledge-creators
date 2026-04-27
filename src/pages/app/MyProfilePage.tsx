import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/app/providers/AuthProvider";
import { subscribeCreatorContent, subscribeProfile } from "@/lib/firebase/publicData";
import { getFirebaseMessaging, firebaseVapidKey } from "@/lib/firebase";
import type { ContentModel, UserModel } from "@/types/models";

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
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setInstallBtnText("📲 Install App");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === "accepted") {
        setInstallBtnText("✅ Installed");
        alert("App installed to your home screen!");
      } else {
        alert("Installation was cancelled.");
      }
      deferredPromptRef.current = null;
    } else {
      alert("To install: Look for the browser's 'Add to Home Screen' or 'Install App' option in the menu (three dots), or the browser may not support PWA installation on this device.");
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
      if (messaging && user?.id) {
        const token = await getToken(messaging, { vapidKey: firebaseVapidKey });
        const { firestore } = await import("@/lib/firebase");
        if (firestore) {
          await updateDoc(doc(firestore, "users", user.id), {
            fcmToken: token,
            notificationsEnabled: true,
          });
        }
      }

      setNotifyBtnText("🔔 Enabled");
      alert("Notifications enabled! You'll receive push notifications from Dreamledge.");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Failed to enable notifications: " + errorMessage);
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

  useEffect(() => {
    let messaging: Messaging | null = null;

    const setupFCM = async () => {
      try {
        messaging = await getFirebaseMessaging();
        if (!messaging) return;

        onMessage(messaging, (payload) => {
          console.log("Foreground notification received:", payload);
        });
      } catch (err) {
        console.error("FCM setup error:", err);
      }
    };

    if (user?.id) {
      setupFCM();
    }
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
        fcmToken: null,
        notificationsEnabled: true,
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