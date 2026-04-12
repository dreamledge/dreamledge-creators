import { useMemo, useState } from "react";
import { BattleScoreCard } from "@/components/battles/BattleScoreCard";
import { Button } from "@/components/ui/Button";

export function BattleJudgePanel({ unlocked }: { unlocked: boolean }) {
  const [originality, setOriginality] = useState(8);
  const [quality, setQuality] = useState(8);
  const [creativity, setCreativity] = useState(8);
  const average = useMemo(() => ((originality + quality + creativity) / 3).toFixed(1), [creativity, originality, quality]);

  return (
    <div className="bubble-card rounded-[38px] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Judge opponent</p>
          <h3 className="mt-2 text-2xl font-semibold text-text-primary">Score the other creator</h3>
        </div>
        <div className={`rounded-[999px] px-3 py-2 text-xs uppercase tracking-[0.24em] ${unlocked ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
          {unlocked ? "Unlocked" : "Locked"}
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <BattleScoreCard label="Originality" value={originality} onChange={setOriginality} />
        <BattleScoreCard label="Quality" value={quality} onChange={setQuality} />
        <BattleScoreCard label="Creativity" value={creativity} onChange={setCreativity} />
      </div>
      <div className="mt-5 bubble-card rounded-[32px] p-4 text-sm text-text-secondary">
        Average score: <span className="font-semibold text-text-primary">{average}</span>
      </div>
      <Button disabled={!unlocked} className="mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50 bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white">
        Submit judgment
      </Button>
    </div>
  );
}
