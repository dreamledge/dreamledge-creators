import { Bell, Flag, Home, LayoutDashboard, Medal, MessagesSquare, Settings, Shield, Trophy, Users, WandSparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  ["/app/home", "Home", Home],
  ["/app/explore", "Explore", WandSparkles],
  ["/app/create", "Create", LayoutDashboard],
  ["/app/battles", "Battles", Trophy],
  ["/app/leaderboards", "Leaderboards", Medal],
  ["/app/messages", "Messages", MessagesSquare],
  ["/app/notifications", "Notifications", Bell],
  ["/app/crews", "Crews", Users],
  ["/app/settings", "Settings", Settings],
  ["/admin", "Admin", Shield],
] as const;

export function DesktopSidebar() {
  return (
    <aside className="sticky top-[89px] hidden h-[calc(100vh-110px)] w-72 shrink-0 flex-col rounded-[40px] border border-white/8 bg-zinc-900/78 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex">
      <div className="mb-6 rounded-[32px] border border-white/8 bg-red-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Competition mode</p>
        <p className="mt-2 text-xl font-semibold text-text-primary">Battle. Rank. Get discovered.</p>
      </div>
      <div className="space-y-2 overflow-y-auto scrollbar-hidden">
        {navItems.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-[28px] px-4 py-3 text-sm ${isActive ? "border border-red-400/20 bg-red-500/10 text-white" : "text-zinc-400 hover:bg-white/6 hover:text-white"}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <div className="mt-auto rounded-[32px] border border-white/8 bg-black/20 p-4 text-sm text-zinc-400">
        <div className="flex items-center gap-2 text-text-primary"><Flag size={16} /> Admin moderation and reports are scaffolded with prototype data.</div>
      </div>
    </aside>
  );
}
