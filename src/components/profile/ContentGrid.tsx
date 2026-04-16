import { FeedList, FeedProvider } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import type { ContentModel } from "@/types/models";

export function ContentGrid({ items }: { items: ContentModel[] }) {
  return (
    <CommentModalProvider>
      <FeedProvider>
        <div className="profile-content-feed">
          <FeedList items={items} />
        </div>
        <CommentModal />
      </FeedProvider>
    </CommentModalProvider>
  );
}
