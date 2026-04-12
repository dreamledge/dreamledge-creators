import { BattleCard } from "@/components/cards/BattleCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockBattles } from "@/lib/constants/mockData";

export function BattlesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Battles" title="High-stakes creator matchups" description="Every matchup uses a 10-second watch gate before originality, quality, and creativity can be judged." />
      <div className="grid gap-4 xl:grid-cols-2">{mockBattles.map((battle) => <BattleCard key={battle.id} battle={battle} />)}</div>
    </div>
  );
}
