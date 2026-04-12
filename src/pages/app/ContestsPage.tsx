import { ContestCard } from "@/components/cards/ContestCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockContests } from "@/lib/constants/mockData";

export function ContestsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Contests" title="Weekly stages built for discovery and status" />
      <div className="grid gap-4 xl:grid-cols-2">{mockContests.map((contest) => <ContestCard key={contest.id} contest={contest} />)}</div>
    </div>
  );
}
