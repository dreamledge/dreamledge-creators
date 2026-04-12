import type { CrewModel } from "@/types/models";

export function CrewHeader({ crew }: { crew: CrewModel }) {
  return (
    <div className="overflow-hidden rounded-[40px] border border-white/10 bg-card/90">
      <img src={crew.bannerUrl} alt={crew.name} className="h-48 w-full object-cover" />
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-text-primary">{crew.name}</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">{crew.description}</p>
      </div>
    </div>
  );
}
