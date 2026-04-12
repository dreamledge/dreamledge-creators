import { Link } from "react-router-dom";
import type { CrewModel } from "@/types/models";

export function CrewCard({ crew }: { crew: CrewModel }) {
  return (
    <Link to={`/app/crews/${crew.id}`} className="block overflow-hidden rounded-[36px] border border-white/10 bg-card/90">
      <img src={crew.bannerUrl} alt={crew.name} className="h-36 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold text-text-primary">{crew.name}</h3>
        <p className="mt-2 text-sm text-text-secondary">{crew.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>{crew.memberCount} members</span>
          <span>{crew.totalPoints} pts</span>
        </div>
      </div>
    </Link>
  );
}
