import { Button } from "@/components/ui/Button";

export function ChatInput() {
  return (
    <div className="flex gap-3 rounded-[32px] border border-white/10 bg-card/90 p-4">
      <input className="min-w-0 flex-1 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" placeholder="Send a message, battle invite, or shared content" />
      <Button>Send</Button>
    </div>
  );
}
