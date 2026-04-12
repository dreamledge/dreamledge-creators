import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildEmbedUrl, validateCreatorUrl } from "@/lib/validators/content";

export function ContentImportForm() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [title, setTitle] = useState("High impact creator clip");
  const [caption, setCaption] = useState("Built for battles, contests, and discovery.");
  const [category, setCategory] = useState("best creator of the week");

  const preview = useMemo(() => {
    const validation = validateCreatorUrl(url);
    return {
      ...validation,
      embedUrl: buildEmbedUrl(url, validation.platform),
    };
  }, [url]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
      <div className="bubble-card rounded-[38px] p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">Import public content</h2>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Paste TikTok, YouTube, X, or Facebook URL" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Title" />
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" rows={4} placeholder="Caption" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Category" />
        <Button className="w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white">Publish content</Button>
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
