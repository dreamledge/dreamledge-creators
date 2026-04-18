import { ContentCard } from "@/components/cards/ContentCard";
import { getVisibleMockContent } from "@/lib/constants/mockData";
import type { ContestEntryModel } from "@/types/models";

export function ContestEntryGrid({ entries }: { entries: ContestEntryModel[] }) {
  const visibleContent = getVisibleMockContent();
  const items = entries.map((entry) => visibleContent.find((content) => content.id === entry.contentId)).filter(Boolean);
  return <div className="grid gap-4 lg:grid-cols-2">{items.map((item) => item && <ContentCard key={item.id} content={item} />)}</div>;
}
