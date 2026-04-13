import { Home, Search, Video, Swords, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/app/home", label: "Home", icon: Home },
  { to: "/app/explore", label: "Explore", icon: Search },
  { to: "/app/review-session", label: "Session", icon: Video },
  { to: "/app/battles", label: "Battles", icon: Swords },
  { to: "/app/me", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[36px] border border-white/8 bg-zinc-900/85 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-[28px] px-2 py-3 text-[11px] ${isActive ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-400"}`}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
