import { FeedList, FeedProvider } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import { LikedByModalProvider } from "@/components/overlays/LikedByModal";
import type { ContentModel, UserModel } from "@/types/models";

export function ContentGrid({ items, creatorsById, currentUserId }: { items: ContentModel[]; creatorsById?: Map<string, UserModel>; currentUserId?: string }) {
  return (
    <LikedByModalProvider>
      <CommentModalProvider>
        <FeedProvider>
          <div className="profile-content-feed">
            <FeedList items={items} creatorsById={creatorsById} currentUserId={currentUserId} />
          </div>
          <CommentModal />
        </FeedProvider>
      </CommentModalProvider>
    </LikedByModalProvider>
  );
}
