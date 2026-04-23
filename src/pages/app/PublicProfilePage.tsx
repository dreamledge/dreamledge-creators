import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { subscribeCreatorContent, subscribeProfile } from "@/lib/firebase/publicData";
import type { ContentModel, UserModel } from "@/types/models";

export function PublicProfilePage() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [creator, setCreator] = useState<UserModel | null>(null);
  const [items, setItems] = useState<ContentModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <ProfileCard creator={creator} />
      <BadgeList badges={creator.badges} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "posts" ? <ContentGrid items={profileItems} /> : null}
    </div>
  );
}
