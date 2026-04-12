import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Settings" title="Creator preferences and account controls" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bubble-card rounded-[38px] p-5 space-y-4">
          <input className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" value="Creator competition mode" readOnly />
          <input className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" value="Weekly reminders on" readOnly />
          <Button className="w-full">Save settings</Button>
        </div>
        <div className="bubble-card rounded-[38px] p-5 text-text-secondary">Firebase Auth, Firestore, and Storage are scaffolded here for later live configuration.</div>
      </div>
    </div>
  );
}
