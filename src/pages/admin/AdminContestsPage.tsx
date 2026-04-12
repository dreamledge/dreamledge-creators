import { ContestCard } from "@/components/cards/ContestCard";
import { mockContests } from "@/lib/constants/mockData";

export function AdminContestsPage() {
  return <div className="grid gap-4 xl:grid-cols-2">{mockContests.map((contest) => <ContestCard key={contest.id} contest={contest} />)}</div>;
}
