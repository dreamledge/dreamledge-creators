import { useState } from "react";
import { creatorCategories, creatorGoals } from "@/lib/constants/app";
import { Button } from "@/components/ui/Button";

export function ProfileSetupForm({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState("dreambuilder");
  const [displayName, setDisplayName] = useState("Dream Builder");
  const [bio, setBio] = useState("Building competitive creator momentum.");

  return (
    <div className="space-y-4 bubble-card rounded-[38px] p-5">
      <h2 className="text-2xl font-semibold text-text-primary">Finish your creator setup</h2>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-white">Username</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Your @ name on Dreamledge" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-white">Display name</span>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="The name people will see" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-white">Bio</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" rows={4} placeholder="Tell people what kind of creator you are" />
      </label>
      <div>
        <p className="mb-2 text-sm text-text-secondary">Categories</p>
        <div className="flex flex-wrap gap-2">{creatorCategories.slice(0, 8).map((item) => <span key={item} className="rounded-[999px] border border-white/10 px-3 py-1 text-xs text-text-secondary">{item}</span>)}</div>
      </div>
      <div>
        <p className="mb-2 text-sm text-text-secondary">Goals</p>
        <div className="flex flex-wrap gap-2">{creatorGoals.map((item) => <span key={item} className="rounded-[999px] border border-white/10 px-3 py-1 text-xs text-text-secondary">{item}</span>)}</div>
      </div>
      <Button onClick={onComplete} className="w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white">Enter the platform</Button>
    </div>
  );
}
