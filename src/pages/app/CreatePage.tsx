import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContentImportForm } from "@/components/forms/ContentImportForm";

export function CreatePage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Creator studio" title="Import public content and make it battle-ready" description="Paste a TikTok, YouTube, X, or Facebook link, then shape it into a premium submission." />
      <ContentImportForm />
    </div>
  );
}
