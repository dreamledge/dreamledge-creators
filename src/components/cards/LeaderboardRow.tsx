import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { LeaderboardSnapshotModel } from "@/types/models";

export function LeaderboardRow({ row }: { row: LeaderboardSnapshotModel }) {
  const creator = mockUsers.find((user) => user.id === row.userId);
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 bubble-card rounded-[34px] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-sm font-semibold text-white">#{row.rank}</div>
      <div className="flex items-center gap-3">
        <img src={creator?.photoUrl} alt={creator?.displayName} className="h-11 w-11 rounded-[28px] object-cover" />
        <div>
          <VerifiedLabel text={creator?.displayName ?? "Creator"} verified={creator?.verified} className="font-semibold text-text-primary" textClassName="font-semibold text-text-primary" iconClassName="verified-label__icon--tiny" />
          <VerifiedLabel text={`@${creator?.username ?? "creator"}`} verified={false} className="text-sm text-text-secondary" textClassName="text-sm text-text-secondary" />
        </div>
      </div>
      <div className="text-right text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">{row.points}</p>
        <p>{row.battleWins} battle wins</p>
      </div>
    </div>
  );
}
