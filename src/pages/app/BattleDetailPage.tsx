import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BattleCommentsSection } from "@/components/battles/BattleCommentsSection";
import { BattleJudgePanel } from "@/components/battles/BattleJudgePanel";
import { BattleResultBanner } from "@/components/battles/BattleResultBanner";
import { BattleVSLayout } from "@/components/battles/BattleVSLayout";
import { BattleWatchTimer } from "@/components/battles/BattleWatchTimer";
import { Button } from "@/components/ui/Button";
import { mockBattles, mockUsers } from "@/lib/constants/mockData";

export function BattleDetailPage() {
  const { battleId } = useParams();
  const battle = mockBattles.find((entry) => entry.id === battleId) ?? mockBattles[1];
  const [watchedSeconds, setWatchedSeconds] = useState(battle.creatorBWatchTime);
  const unlocked = watchedSeconds >= 10;
  const winnerName = useMemo(() => {
    if (!battle.winnerId) return null;
    return mockUsers.find((user) => user.id === battle.winnerId)?.displayName ?? null;
  }, [battle.winnerId]);

  return (
    <div className="space-y-6">
      <BattleResultBanner winner={winnerName} />
      <BattleVSLayout battle={battle} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <BattleWatchTimer watchedSeconds={watchedSeconds} />
          <Button className="w-full" onClick={() => setWatchedSeconds((value) => Math.min(10, value + 1))}>Watch 1 more second</Button>
          <div className="bubble-card rounded-[34px] p-4 text-sm text-text-secondary">
            Judge portion: each creator scores the other creator only. Community voting does not decide the battle.
          </div>
        </div>
        <BattleJudgePanel unlocked={unlocked} />
      </div>
      <BattleCommentsSection />
    </div>
  );
}
