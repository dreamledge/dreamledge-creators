import { BadgeList } from "@/components/profile/BadgeList";
import { ContentGrid } from "@/components/profile/ContentGrid";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useAuth } from "@/app/providers/AuthProvider";
import { mockContent } from "@/lib/constants/mockData";

export function MyProfilePage() {
  const { user } = useAuth();
  const items = mockContent.filter((item) => item.creatorId === user?.id);
  return (
    <div className="space-y-6">
      {user && <ProfileCard creator={user as any} isOwnProfile />}
      <BadgeList badges={[]} />
      <ProfileTabs />
      <ContentGrid items={items} />
    </div>
  );
}
