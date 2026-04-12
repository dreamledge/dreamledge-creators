export function BattleScoreCard({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2 bubble-card rounded-[32px] p-4">
      <div className="flex items-center justify-between text-sm text-text-primary">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </label>
  );
}
