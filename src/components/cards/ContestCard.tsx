import { Link } from "react-router-dom";
import type { ContestModel } from "@/types/models";
import { formatTimeRemaining } from "@/lib/formatters";

export function ContestCard({ contest }: { contest: ContestModel }) {
  return (
    <Link to={`/app/contests/${contest.id}`} className="block overflow-hidden rounded-[36px] border border-white/10 bg-card/90">
      <img src={contest.bannerUrl} alt={contest.title} className="h-40 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">{contest.category}</p>
        <h3 className="mt-2 text-xl font-semibold text-text-primary">{contest.title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{contest.description}</p>
        <p className="mt-4 text-sm text-text-secondary">{formatTimeRemaining(contest.endAt)}</p>
      </div>
    </Link>
  );
}
