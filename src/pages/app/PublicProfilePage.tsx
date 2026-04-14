import { useParams } from "react-router-dom";
import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { mockContent, mockUsers } from "@/lib/constants/mockData";

export function PublicProfilePage() {
  const { userId } = useParams();
  const creator = mockUsers.find((item) => item.id === userId) ?? mockUsers[1];
  const items = mockContent.filter((item) => item.creatorId === creator.id);
  return (
    <div className="space-y-6">
      <ProfileCard creator={creator} />
      <BadgeList badges={creator.badges} />
      <ProfileTabs />
      <ContentGrid items={items} />
    </div>
  );
}
