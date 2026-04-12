import { CreatorCard } from "@/components/cards/CreatorCard";
import { BattleCard } from "@/components/cards/BattleCard";
import { ContestCard } from "@/components/cards/ContestCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockBattles, mockContests, mockUsers } from "@/lib/constants/mockData";

export function ExplorePage() {
  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Explore" title="Discover rising creators, active battles, and hot contests" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{mockUsers.map((user) => <CreatorCard key={user.id} creator={user} showSocialLinks />)}</div>
      <div className="grid gap-4 xl:grid-cols-2">{mockBattles.map((battle) => <BattleCard key={battle.id} battle={battle} />)}</div>
      <div className="grid gap-4 xl:grid-cols-2">{mockContests.map((contest) => <ContestCard key={contest.id} contest={contest} />)}</div>
    </div>
  );
}
