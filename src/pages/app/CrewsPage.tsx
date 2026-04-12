import { CrewCard } from "@/components/cards/CrewCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockCrews } from "@/lib/constants/mockData";

export function CrewsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Crews" title="Team up after you build your own creator identity" />
      <div className="grid gap-4 xl:grid-cols-2">{mockCrews.map((crew) => <CrewCard key={crew.id} crew={crew} />)}</div>
    </div>
  );
}
