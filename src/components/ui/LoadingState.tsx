import { DreamledgeLoader } from "@/components/ui/DreamledgeLoader";

export function LoadingState() {
  return (
    <div className="bubble-card rounded-[36px] flex min-h-48 items-center justify-center p-6">
      <DreamledgeLoader />
    </div>
  );
}
