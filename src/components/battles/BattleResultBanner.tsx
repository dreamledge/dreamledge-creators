export function BattleResultBanner({ winner }: { winner: string | null }) {
  return (
    <div className="rounded-[36px] bg-[linear-gradient(135deg,rgba(255,45,61,0.24),rgba(255,77,77,0.2),rgba(255,255,255,0.08))] p-5 text-text-primary">
      <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Battle result</p>
      <p className="mt-2 text-2xl font-semibold">{winner ? `${winner} leads the battle` : "Waiting for both creators to judge"}</p>
    </div>
  );
}
