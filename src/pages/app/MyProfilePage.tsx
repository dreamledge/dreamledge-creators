import { useState } from "react";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/app/providers/AuthProvider";
import { mockContent, mockUsers } from "@/lib/constants/mockData";

export function MyProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const creator = user ? mockUsers.find((entry) => entry.id === user.id)
    ?? mockUsers.find((entry) => entry.username === user.username)
    ?? mockUsers.find((entry) => entry.email === user.email)
    ?? ({
    ...user,
    bannerUrl: "",
    bio: "",
    categories: [],
    goals: [],
    socialLinks: {},
    totalPoints: 0,
    battleWins: 0,
    contestWins: 0,
    followerCount: 0,
    followingCount: 0,
    followerIds: [],
    followingIds: [],
    badges: [],
    verified: false,
    rookie: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }) : null;
  const items = mockContent.filter((item) => item.creatorId === creator?.id);

  return (
    <div className="space-y-6">
      {creator ? <ProfileCard creator={creator} isOwnProfile /> : null}
      <BadgeList badges={creator?.badges ?? []} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "posts" ? <ContentGrid items={items} /> : null}
    </div>
  );
}
