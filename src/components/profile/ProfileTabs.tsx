export function ProfileTabs() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
      {["Posts", "Battles", "Contests", "Wins", "About"].map((tab, index) => (
        <button key={tab} className={`shrink-0 rounded-[999px] px-4 py-2 text-sm ${index === 0 ? "bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" : "border border-white/10 bg-white/4 text-text-secondary"}`}>{tab}</button>
      ))}
    </div>
  );
}
