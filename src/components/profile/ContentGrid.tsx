import { ContentCard } from "@/components/cards/ContentCard";
import type { ContentModel } from "@/types/models";

export function ContentGrid({ items }: { items: ContentModel[] }) {
  return <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => <ContentCard key={item.id} content={item} />)}</div>;
}
