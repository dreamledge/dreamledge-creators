import { useParams } from "react-router-dom";
import { CrewHeader } from "@/components/crews/CrewHeader";
import { CrewMemberList } from "@/components/crews/CrewMemberList";
import { mockCrewMembers, mockCrews } from "@/lib/constants/mockData";

export function CrewDetailPage() {
  const { crewId } = useParams();
  const crew = mockCrews.find((entry) => entry.id === crewId) ?? mockCrews[0];
  const members = mockCrewMembers.filter((member) => member.crewId === crew.id);
  return (
    <div className="space-y-6">
      <CrewHeader crew={crew} />
      <CrewMemberList members={members} />
    </div>
  );
}
