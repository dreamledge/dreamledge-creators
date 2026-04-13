import { Link } from "react-router-dom";
import { BattleCard } from "@/components/cards/BattleCard";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockBattles } from "@/lib/constants/mockData";

export function BattlesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Battles" title="High-stakes creator matchups" description="Every matchup uses a 10-second watch gate before originality, quality, and creativity can be judged." />
      <div className="bubble-card rounded-[36px] p-5">
        <h3 className="text-xl font-semibold text-white">Need a judge-for-judge creator session instead?</h3>
        <p className="mt-2 text-sm text-zinc-400">Start a random 1v1 review room where both creators submit one video, watch for 15 real seconds, and review each other with no winner logic.</p>
        <Link to="/app/review-session"><Button className="mt-4 bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white">Open Session Room</Button></Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">{mockBattles.map((battle) => <BattleCard key={battle.id} battle={battle} />)}</div>
    </div>
  );
}
