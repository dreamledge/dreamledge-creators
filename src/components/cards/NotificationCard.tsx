import { mockUsers } from "@/lib/constants/mockData";
import type { NotificationModel } from "@/types/models";

export function NotificationCard({ notification }: { notification: NotificationModel }) {
  const actor = mockUsers.find((user) => user.id === notification.actorId);
  return (
    <div className="bubble-card rounded-[34px] p-4">
      <div className="flex items-center gap-3">
        <img src={actor?.photoUrl} alt={actor?.displayName} className="h-12 w-12 rounded-[28px] object-cover" />
        <div>
          <p className="font-medium text-text-primary">{actor?.displayName} · {notification.type}</p>
          <p className="text-sm text-text-secondary">Target: {notification.targetType}</p>
        </div>
      </div>
    </div>
  );
}
