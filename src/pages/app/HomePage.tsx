import { useState } from "react";
import { FeedFilterBar } from "@/components/feed/FeedFilterBar";
import { FeedList } from "@/components/feed/FeedList";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { GradientCard } from "@/components/ui/GradientCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockContent } from "@/lib/constants/mockData";
import type { FeedTab } from "@/types/models";

export function HomePage() {
  const [active, setActive] = useState<FeedTab>("for-you");

  return (
    <div className="space-y-6">
      <GradientCard>
        <SectionHeader eyebrow="Home feed" title="The competitive feed for creators chasing real rank" description="Swipe through content built for battles, contests, saves, and status." />
      </GradientCard>
      <FeedTabs active={active} onChange={setActive} />
      <FeedFilterBar />
      <FeedList items={mockContent} />
    </div>
  );
}
