import { useEffect, useRef } from "react";
import type { ReviewSessionSubmission, ReviewWatchProgress } from "@/types/models";

export function SessionVideoPlayer({
  submission,
  watchProgress,
  onWatchProgress,
  canTrackWatch,
}: {
  submission: ReviewSessionSubmission | null;
  watchProgress?: ReviewWatchProgress;
  onWatchProgress?: (watchedMilliseconds: number, lastPlaybackPosition: number) => void;
  canTrackWatch?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !watchProgress || !canTrackWatch) return;

    const handleSeeking = () => {
      const allowedPosition = Math.max(watchProgress.watchedMilliseconds / 1000, 0);
      if (video.currentTime > allowedPosition + 0.75) {
        video.currentTime = allowedPosition;
      }
    };

    video.addEventListener("seeking", handleSeeking);
    return () => video.removeEventListener("seeking", handleSeeking);
  }, [canTrackWatch, watchProgress]);

  if (!submission) {
    return <div className="bubble-card rounded-[36px] p-5 text-sm text-zinc-400">Waiting for content submission...</div>;
  }

  return (
    <div className="bubble-card rounded-[36px] p-4">
      <video
        ref={videoRef}
        className="h-72 w-full rounded-[30px] object-cover"
        src={submission.playbackUrl}
        controls
        playsInline
        preload="metadata"
        onTimeUpdate={(event) => {
          if (!canTrackWatch || !watchProgress || !onWatchProgress) return;
          const video = event.currentTarget;
          const currentPosition = Math.floor(video.currentTime * 1000);
          if (currentPosition > watchProgress.lastPlaybackPosition) {
            onWatchProgress(Math.max(watchProgress.watchedMilliseconds, currentPosition), currentPosition);
          }
        }}
      />
      <div className="mt-3 text-sm text-zinc-300">
        <p className="font-semibold text-white">Submission type: {submission.contentType.replace(/_/g, " ")}</p>
        <a href={submission.contentUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-zinc-400 underline-offset-4 hover:underline">
          {submission.contentUrl}
        </a>
      </div>
    </div>
  );
}
