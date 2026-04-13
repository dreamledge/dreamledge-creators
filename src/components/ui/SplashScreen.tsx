import { DreamledgeLoader } from "@/components/ui/DreamledgeLoader";

export function SplashScreen({ fading = false }: { fading?: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.14),transparent_28%),linear-gradient(180deg,#08080b_0%,#09090d_55%,#12090d_100%)] transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <DreamledgeLoader />
        <p className="text-[11px] uppercase tracking-[0.38em] text-[#F5F5F7]/45">Dreamledge Creators</p>
      </div>
    </div>
  );
}
