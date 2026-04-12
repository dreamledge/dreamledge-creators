import type { UserModel } from "@/types/models";

export function ProfileStatsBar({ creator }: { creator: UserModel }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {[
        [creator.totalPoints, "points"],
        [creator.battleWins, "battle wins"],
        [creator.contestWins, "contest wins"],
        [creator.followerCount, "followers"],
        [creator.followingCount, "following"],
      ].map(([value, label]) => (
        <div key={label} className="bubble-card rounded-[34px] p-4">
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      ))}
    </div>
  );
}
