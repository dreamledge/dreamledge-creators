export function BadgeList({ badges }: { badges: string[] }) {
  return <div className="flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className="rounded-[999px] border border-white/10 bg-white/4 px-3 py-1 text-xs text-text-secondary">{badge}</span>)}</div>;
}
