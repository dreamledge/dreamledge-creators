import { useState } from "react";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/app/providers/AuthProvider";
import { getVisibleMockContent } from "@/lib/constants/mockData";
import type { UserModel } from "@/types/models";

export function MyProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const creator: UserModel | null = user
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;
  const items = getVisibleMockContent().filter((item) => item.creatorId === creator?.id);

  return (
    <div className="space-y-6">
      {creator ? <ProfileCard creator={creator} isOwnProfile /> : null}
      <BadgeList badges={creator?.badges ?? []} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "posts" ? <ContentGrid items={items} /> : null}
    </div>
  );
}
