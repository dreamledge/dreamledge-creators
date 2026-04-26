import { Button } from "@/components/ui/Button";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { UserModel } from "@/types/models";

export function ProfileHeader({ creator }: { creator: UserModel }) {
  return (
    <div className="overflow-hidden rounded-[40px] border border-white/10 bg-card/90">
      <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${creator.bannerUrl})` }} />
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <img src={creator.photoUrl} alt={creator.displayName} className="-mt-16 h-24 w-24 rounded-[36px] border-4 border-card object-cover" />
            <div>
              <VerifiedLabel text={creator.displayName} verified={creator.verified} className="text-3xl font-semibold text-text-primary" textClassName="text-3xl font-semibold text-text-primary" iconClassName="h-[18px] w-[18px]" />
              <VerifiedLabel text={`@${creator.username}`} verified={creator.verified} className="text-text-secondary" textClassName="text-text-secondary" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Follow</Button>
            <Button>Message</Button>
            <Button>Invite to Battle</Button>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-text-secondary">{creator.bio}</p>
      </div>
    </div>
  );
}
