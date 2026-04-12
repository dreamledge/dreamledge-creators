import type { FeedTab } from "@/types/models";

const tabs: { key: FeedTab; label: string }[] = [
  { key: "for-you", label: "For You" },
  { key: "following", label: "Following" },
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "contests", label: "Contests" },
  { key: "battles", label: "Battles" },
];

export function FeedTabs({ active, onChange }: { active: FeedTab; onChange: (tab: FeedTab) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => onChange(tab.key)} className={`shrink-0 rounded-[999px] px-4 py-2 text-sm ${active === tab.key ? "bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" : "border border-white/10 bg-white/4 text-text-secondary"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
