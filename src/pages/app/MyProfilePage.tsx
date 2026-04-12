import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStatsBar } from "@/components/profile/ProfileStatsBar";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { mockContent, mockUsers } from "@/lib/constants/mockData";

export function MyProfilePage() {
  const creator = mockUsers[0];
  const items = mockContent.filter((item) => item.creatorId === creator.id);
  return (
    <div className="space-y-6">
      <ProfileHeader creator={creator} />
      <ProfileStatsBar creator={creator} />
      <BadgeList badges={creator.badges} />
      <ProfileTabs />
      <ContentGrid items={items} />
    </div>
  );
}
