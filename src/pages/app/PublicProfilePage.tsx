import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { subscribeCreatorContent, subscribeProfile } from "@/lib/firebase/publicData";
import type { ContentModel, UserModel } from "@/types/models";

export function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [creator, setCreator] = useState<UserModel | null>(null);
  const [items, setItems] = useState<ContentModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const goBack = () => {
    if (location.state?.from === "explore") {
      navigate(-1);
    } else {
      navigate("/app/explore");
    }
  };

  useEffect(() => {
    if (!userId) {
      setCreator(null);
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribeProfile = subscribeProfile(userId, (nextProfile) => {
      setCreator(nextProfile);
      setIsLoading(false);
    });

    const unsubscribeContent = subscribeCreatorContent(userId, setItems);

    return () => {
      unsubscribeProfile();
      unsubscribeContent();
    };
  }, [userId]);

  const profileItems = useMemo(() => items.filter((item) => item.creatorId === creator?.id), [creator?.id, items]);

  if (isLoading) {
    return <div className="bubble-card rounded-[32px] p-6 text-sm text-text-secondary">Loading profile...</div>;
  }

  if (!creator) {
    return (
      <div className="bubble-card rounded-[32px] p-6 text-sm text-text-secondary">
        This profile is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button type="button" className="profile-back-btn" onClick={goBack} aria-label="Back to explore">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ProfileCard creator={creator} />
      <BadgeList badges={creator.badges} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "posts" ? <ContentGrid items={profileItems} /> : null}
    </div>
  );
}
