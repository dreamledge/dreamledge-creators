import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ReviewContentType, ReviewSessionSubmission } from "@/types/models";

const contentTypes: ReviewContentType[] = ["uploaded_video", "tiktok", "youtube", "instagram", "facebook", "clip_url"];

export function SessionSubmissionForm({ creatorId, onSubmit }: { creatorId: string; onSubmit: (submission: ReviewSessionSubmission) => void }) {
  const [contentType, setContentType] = useState<ReviewContentType>("uploaded_video");
  const [contentUrl, setContentUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80");

  return (
    <div className="bubble-card rounded-[36px] p-5">
      <h3 className="text-xl font-semibold text-white">Submit your session video</h3>
      <div className="mt-4 space-y-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white">Content type</span>
          <select value={contentType} onChange={(event) => setContentType(event.target.value as ReviewContentType)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-white">
            {contentTypes.map((type) => <option key={type} value={type} className="bg-zinc-950">{type.replace(/_/g, " ")}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white">Video URL</span>
          <input value={contentUrl} onChange={(event) => setContentUrl(event.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Paste TikTok, YouTube, Instagram, Facebook, or clip URL" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white">Thumbnail URL</span>
          <input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Optional thumbnail image URL" />
        </label>
      </div>
      <Button
        className="mt-4 w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white"
        onClick={() =>
          onSubmit({
            creatorId,
            contentUrl,
            contentType,
            thumbnailUrl,
            submittedAt: new Date().toISOString(),
            playbackUrl: "/landingpagebackround.mp4",
          })
        }
      >
        Submit video
      </Button>
    </div>
  );
}
