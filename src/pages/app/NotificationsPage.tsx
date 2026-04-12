import { NotificationCard } from "@/components/cards/NotificationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockNotifications } from "@/lib/constants/mockData";

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Notifications" title="Everything that moves your creator momentum" />
      <div className="space-y-3">{mockNotifications.map((item) => <NotificationCard key={item.id} notification={item} />)}</div>
    </div>
  );
}
