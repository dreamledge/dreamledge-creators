import { useState } from "react";
import { LeaderboardRow } from "@/components/cards/LeaderboardRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockLeaderboard, mockWeeklyLeaderboard } from "@/lib/constants/mockData";

export function LeaderboardsPage() {
  const [tab, setTab] = useState<"global" | "weekly">("global");
  const rows = tab === "global" ? mockLeaderboard : mockWeeklyLeaderboard;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Leaderboards" title="Prestige, wins, and creator momentum" />
      <div className="flex gap-2">
        <button onClick={() => setTab("global")} className={`rounded-[999px] px-4 py-2 text-sm ${tab === "global" ? "bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" : "border border-white/10 bg-white/4 text-text-secondary"}`}>Global</button>
        <button onClick={() => setTab("weekly")} className={`rounded-[999px] px-4 py-2 text-sm ${tab === "weekly" ? "bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" : "border border-white/10 bg-white/4 text-text-secondary"}`}>Weekly</button>
      </div>
      <div className="space-y-3">{rows.map((row) => <LeaderboardRow key={row.id} row={row} />)}</div>
    </div>
  );
}
