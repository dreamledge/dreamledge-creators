import { sessionReviewAverage } from "@/features/reviewSessions/sessionLogic";
import type { ReviewSubmissionRecord, UserModel } from "@/types/models";

function labelText(value: string | null) {
  if (!value) return "-";
  return value === "trash" ? "Trash" : value === "ok" ? "OK" : "Fire";
}

export function ReviewSummaryCard({ title, creator, review }: { title: string; creator: UserModel; review: ReviewSubmissionRecord | null }) {
  return (
    <div className="bubble-card rounded-[36px] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <img src={creator.photoUrl} alt={creator.displayName} className="h-14 w-14 rounded-[28px] object-cover" />
        <div>
          <p className="font-semibold text-white">{creator.displayName}</p>
          <p className="text-sm text-zinc-400">@{creator.username}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-[24px] border border-white/10 bg-white/4 p-3 text-white">{labelText(review?.scores.creativity ?? null)}</div>
        <div className="rounded-[24px] border border-white/10 bg-white/4 p-3 text-white">{labelText(review?.scores.execution ?? null)}</div>
        <div className="rounded-[24px] border border-white/10 bg-white/4 p-3 text-white">{labelText(review?.scores.entertainment ?? null)}</div>
      </div>
      <p className="mt-4 text-sm text-zinc-400">Average score: <span className="font-semibold text-white">{sessionReviewAverage(review).toFixed(1)}</span></p>
    </div>
  );
}
