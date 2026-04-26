import { Swords } from "lucide-react";
import { mockUsers } from "@/lib/constants/mockData";
import type { BattleModel } from "@/types/models";
import { Link } from "react-router-dom";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";

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
          <VerifiedLabel text={creatorA?.displayName ?? "Creator"} verified={creatorA?.verified} className="font-semibold text-text-primary" textClassName="font-semibold text-text-primary" iconClassName="verified-label__icon--tiny" />
          <VerifiedLabel text={`@${creatorA?.username ?? "creator"}`} verified={creatorA?.verified} className="text-sm text-text-secondary" textClassName="text-sm text-text-secondary" />
        </div>
        <span className="rounded-[999px] bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.24em] text-text-secondary">VS</span>
        <div className="text-right">
          <VerifiedLabel text={creatorB?.displayName ?? "Creator"} verified={creatorB?.verified} className="justify-end font-semibold text-text-primary" textClassName="font-semibold text-text-primary" iconClassName="verified-label__icon--tiny" />
          <VerifiedLabel text={`@${creatorB?.username ?? "creator"}`} verified={creatorB?.verified} className="justify-end text-sm text-text-secondary" textClassName="text-sm text-text-secondary" />
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{battle.theme}</p>
    </Link>
  );
}
