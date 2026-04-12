import type { LeaderboardSnapshotModel, UserModel } from "@/types/models";

export function buildLeaderboard(users: UserModel[], scope: LeaderboardSnapshotModel["scope"]) {
  return [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints || b.battleWins - a.battleWins || b.contestWins - a.contestWins)
    .map((user, index) => ({
      id: `${scope}-${user.id}`,
      userId: user.id,
      scope,
      points: user.totalPoints,
      battleWins: user.battleWins,
      contestWins: user.contestWins,
      rank: index + 1,
    }));
}
