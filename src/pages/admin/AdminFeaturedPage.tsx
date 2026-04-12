import { CreatorCard } from "@/components/cards/CreatorCard";
import { mockUsers } from "@/lib/constants/mockData";

export function AdminFeaturedPage() {
  return <div className="grid gap-4 xl:grid-cols-4">{mockUsers.map((user) => <CreatorCard key={user.id} creator={user} />)}</div>;
}
