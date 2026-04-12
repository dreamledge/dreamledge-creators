import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import { mockUsers } from "@/lib/constants/mockData";
import type { ContentModel } from "@/types/models";

export function ContentCard({ content }: { content: ContentModel }) {
  const creator = mockUsers.find((user) => user.id === content.creatorId);

  return (
    <article className="bubble-card rounded-[38px] p-4">
      <div className="mb-4 flex items-center gap-3">
        <img src={creator?.photoUrl} alt={creator?.displayName} className="h-12 w-12 rounded-[28px] object-cover" />
        <div>
          <p className="font-medium text-text-primary">{creator?.displayName}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{content.platform}</p>
        </div>
      </div>
      <img src={content.thumbnailUrl} alt={content.title} className="h-64 w-full rounded-[32px] object-cover" />
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">{content.title}</h3>
        <p className="text-sm text-text-secondary">{content.caption}</p>
        <div className="flex flex-wrap gap-2">
          {content.tags.map((tag) => <span key={tag} className="rounded-[999px] border border-white/10 px-3 py-1 text-xs text-text-secondary">#{tag}</span>)}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-text-secondary">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1"><Heart size={16} />{formatCompactNumber(content.likeCount)}</span>
          <span className="flex items-center gap-1"><MessageCircle size={16} />{content.commentCount}</span>
        </div>
        <div className="flex gap-3"><Bookmark size={16} /><Share2 size={16} /></div>
      </div>
    </article>
  );
}
