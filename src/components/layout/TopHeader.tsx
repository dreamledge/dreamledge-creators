import { Bell, Search } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export function TopHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">Dreamledge Creators</p>
          <p className="text-lg font-semibold text-text-primary">Where creators compete and rise</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-[999px] border border-white/10 bg-zinc-900/75 p-3 text-white shadow-lg shadow-black/20 backdrop-blur-md"><Search size={18} /></button>
          <button className="rounded-[999px] border border-white/10 bg-zinc-900/75 p-3 text-white shadow-lg shadow-black/20 backdrop-blur-md"><Bell size={18} /></button>
          <img src={user?.photoUrl ?? "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80"} alt="Profile" className="h-10 w-10 rounded-[999px] object-cover" />
        </div>
      </div>
    </header>
  );
}
