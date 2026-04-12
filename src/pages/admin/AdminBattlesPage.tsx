import { BattleCard } from "@/components/cards/BattleCard";
import { mockBattles } from "@/lib/constants/mockData";

export function AdminBattlesPage() {
  return <div className="grid gap-4 xl:grid-cols-2">{mockBattles.map((battle) => <BattleCard key={battle.id} battle={battle} />)}</div>;
}
