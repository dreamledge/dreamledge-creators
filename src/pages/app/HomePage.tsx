import { useState } from "react";
import { FeedFilterBar } from "@/components/feed/FeedFilterBar";
import { FeedList } from "@/components/feed/FeedList";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { mockContent } from "@/lib/constants/mockData";
import type { FeedTab } from "@/types/models";

export function HomePage() {
  const [active, setActive] = useState<FeedTab>("for-you");

  return (
    <div className="space-y-6">
      <div className="home-header">
        <div className="home-header-text">
          <span>dreamledge</span>
          <span className="home-header-creators">creators</span>
        </div>
      </div>
      <FeedTabs active={active} onChange={setActive} />
      <FeedFilterBar />
      <FeedList items={mockContent} />
    </div>
  );
}
