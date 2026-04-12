import { mockContent, mockUsers } from "@/lib/constants/mockData";
import type { BattleModel } from "@/types/models";

export function BattleVSLayout({ battle }: { battle: BattleModel }) {
  const creatorA = mockUsers.find((user) => user.id === battle.creatorAId);
  const creatorB = mockUsers.find((user) => user.id === battle.creatorBId);
  const contentA = mockContent.find((content) => content.id === battle.contentAId);
  const contentB = mockContent.find((content) => content.id === battle.contentBId);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      {[{ creator: creatorA, content: contentA }, { creator: creatorB, content: contentB }].map((item) => (
        <div key={item.creator?.id} className="rounded-[36px] border border-white/10 bg-card/90 p-4">
          <img src={item.content?.thumbnailUrl} alt={item.content?.title} className="h-56 w-full rounded-[32px] object-cover" />
          <div className="mt-4 flex items-center gap-3">
            <img src={item.creator?.photoUrl} alt={item.creator?.displayName} className="h-12 w-12 rounded-[28px] object-cover" />
            <div>
              <p className="font-semibold text-text-primary">{item.creator?.displayName}</p>
              <p className="text-sm text-text-secondary">{item.content?.title}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[999px] bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-xl font-semibold text-white">VS</div>
    </div>
  );
}
