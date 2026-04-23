import { useParams } from "react-router-dom";
import { ContestBanner } from "@/components/contests/ContestBanner";
import { ContestEntryGrid } from "@/components/contests/ContestEntryGrid";
import { ContestLeaderboardPreview } from "@/components/contests/ContestLeaderboardPreview";
import { mockContestEntries, mockContests, mockLeaderboard } from "@/lib/constants/mockData";

export function ContestDetailPage() {
  const { contestId } = useParams();
  const contest = mockContests.find((entry) => entry.id === contestId) ?? null;

  if (!contest) {
    return (
      <div className="bubble-card rounded-[32px] p-6 text-sm text-text-secondary">
        This contest is not available yet.
      </div>
    );
  }

  const entries = mockContestEntries.filter((entry) => entry.contestId === contest.id);

  return (
    <div className="space-y-6">
      <ContestBanner contest={contest} />
      <ContestEntryGrid entries={entries} />
      <ContestLeaderboardPreview rows={mockLeaderboard} />
    </div>
  );
}
