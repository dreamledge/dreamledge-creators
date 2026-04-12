import { mockUsers } from "@/lib/constants/mockData";
import type { CrewMemberModel } from "@/types/models";

export function CrewMemberList({ members }: { members: CrewMemberModel[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {members.map((member) => {
        const creator = mockUsers.find((user) => user.id === member.userId);
        return (
          <div key={member.id} className="flex items-center gap-3 bubble-card rounded-[32px] p-4">
            <img src={creator?.photoUrl} alt={creator?.displayName} className="h-12 w-12 rounded-[28px] object-cover" />
            <div>
              <p className="font-semibold text-text-primary">{creator?.displayName}</p>
              <p className="text-sm text-text-secondary">{member.role}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
