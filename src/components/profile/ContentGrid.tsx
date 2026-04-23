import { FeedList, FeedProvider } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import type { ContentModel, UserModel } from "@/types/models";

export function ContentGrid({ items, creatorsById }: { items: ContentModel[]; creatorsById?: Map<string, UserModel> }) {
  return (
    <CommentModalProvider>
      <FeedProvider>
        <div className="profile-content-feed">
          <FeedList items={items} creatorsById={creatorsById} />
        </div>
        <CommentModal />
      </FeedProvider>
    </CommentModalProvider>
  );
}
