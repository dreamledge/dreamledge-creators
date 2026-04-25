import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/providers/AuthProvider";
import { DEFAULT_CONTENT_THUMBNAIL } from "@/lib/constants/defaults";
import { publishContent, setContentAsDefaultReview, setMatchmakingContent } from "@/lib/firebase/content";
import { buildEmbedUrl, validateCreatorUrl } from "@/lib/validators/content";

export function ContentImportForm() {
  const { user } = useAuth();
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [title, setTitle] = useState("High impact creator clip");
  const [caption, setCaption] = useState("Built for battles, contests, and discovery.");
  const [category, setCategory] = useState("best creator of the week");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const preview = useMemo(() => {
    const validation = validateCreatorUrl(url);
    return {
      ...validation,
      embedUrl: buildEmbedUrl(url, validation.platform),
    };
  }, [url]);

const handlePublish = async () => {
  if (!user) {
    setErrorMessage("Please sign in before publishing content.");
    return;
  }

  if (!preview.valid || preview.platform === "unknown") {
    setErrorMessage("Use a valid TikTok, YouTube, X, or Facebook public link.");
    return;
  }

  setIsSubmitting(true);
  setErrorMessage(null);
  setStatusMessage(null);

  try {
    const result = await publishContent({
      creatorId: user.id,
      sourceUrl: url,
      embedUrl: preview.embedUrl,
      platform: preview.platform,
      title,
      caption,
      category,
      tags: category
        .split(/[,\s]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean),
      thumbnailUrl: DEFAULT_CONTENT_THUMBNAIL,
      status: "published",
      featured: false,
      isDefaultForReview: true, // Always set as default for review
    });

    // Also update the user's matchmaking content ID
    await setMatchmakingContent(user.id, result.id);
    
    // And set this content as default for review
    await setContentAsDefaultReview(user.id, result.id);

    setStatusMessage(`Content published successfully. ID: ${result.id}`);
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Could not publish content.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
      <div className="bubble-card rounded-[38px] p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">Import public content</h2>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Paste TikTok, YouTube, X, or Facebook URL" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Title" />
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" rows={4} placeholder="Caption" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Category" />
        <Button className="w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" onClick={() => void handlePublish()} disabled={isSubmitting || !preview.valid}>
          {isSubmitting ? "Publishing..." : "Publish content"}
        </Button>
        {statusMessage ? <p className="text-sm text-green-400">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      </div>
      <div className="bubble-card rounded-[38px] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Preview</p>
        <p className="mt-3 text-sm text-text-secondary">Platform detected: {preview.platform}</p>
        <div className="mt-4 bubble-card rounded-[34px] p-4">
          <p className="font-semibold text-text-primary">{title}</p>
          <p className="mt-2 text-sm text-text-secondary">{caption}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-text-secondary">Embed / preview link</p>
          <p className="mt-2 break-all text-sm text-text-primary">{preview.embedUrl}</p>
          {!preview.valid ? <p className="mt-4 text-sm text-error">Use a valid TikTok, YouTube, X, or Facebook public link.</p> : null}
        </div>
      </div>
    </div>
  );
}
