import { ContentCard } from "@/components/cards/ContentCard";
import type { ContentModel } from "@/types/models";

export function FeedList({ items }: { items: ContentModel[] }) {
  return <div className="grid gap-4">{items.map((item) => <ContentCard key={item.id} content={item} />)}</div>;
}
