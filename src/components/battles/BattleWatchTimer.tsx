export function BattleWatchTimer({ watchedSeconds }: { watchedSeconds: number }) {
  const progress = Math.min(100, (watchedSeconds / 10) * 100);
  return (
    <div className="bubble-card rounded-[34px] p-4">
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>Watch progress</span>
        <span>{watchedSeconds}/10s</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-[999px] bg-white/8">
        <div className="h-full rounded-[999px] bg-[linear-gradient(90deg,#ff2d3d,#ff6b6b)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
