import type { ContestModel } from "@/types/models";

export function ContestBanner({ contest }: { contest: ContestModel }) {
  return (
    <div className="overflow-hidden rounded-[40px] border border-white/10 bg-card/90">
      <img src={contest.bannerUrl} alt={contest.title} className="h-56 w-full object-cover" />
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">{contest.category}</p>
        <h1 className="mt-3 text-4xl font-semibold text-text-primary">{contest.title}</h1>
        <p className="mt-3 max-w-3xl text-text-secondary">{contest.description}</p>
      </div>
    </div>
  );
}
