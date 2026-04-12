import { LeaderboardRow } from "@/components/cards/LeaderboardRow";
import type { LeaderboardSnapshotModel } from "@/types/models";

export function ContestLeaderboardPreview({ rows }: { rows: LeaderboardSnapshotModel[] }) {
  return <div className="space-y-3">{rows.slice(0, 3).map((row) => <LeaderboardRow key={row.id} row={row} />)}</div>;
}
