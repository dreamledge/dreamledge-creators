import { Swords } from "lucide-react";
import { mockUsers } from "@/lib/constants/mockData";
import type { BattleModel } from "@/types/models";
import { Link } from "react-router-dom";

export function BattleCard({ battle }: { battle: BattleModel }) {
  const creatorA = mockUsers.find((user) => user.id === battle.creatorAId);
  const creatorB = mockUsers.find((user) => user.id === battle.creatorBId);

  return (
    <Link to={`/app/battles/${battle.id}`} className="block bubble-card rounded-[38px] p-5 transition hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">{battle.category}</p>
        <Swords size={18} className="text-secondary" />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="font-semibold text-text-primary">{creatorA?.displayName}</p>
          <p className="text-sm text-text-secondary">@{creatorA?.username}</p>
        </div>
        <span className="rounded-[999px] bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.24em] text-text-secondary">VS</span>
        <div className="text-right">
          <p className="font-semibold text-text-primary">{creatorB?.displayName}</p>
          <p className="text-sm text-text-secondary">@{creatorB?.username}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{battle.theme}</p>
    </Link>
  );
}
