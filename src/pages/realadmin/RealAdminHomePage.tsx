import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function RealAdminHomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <button type="button" className="cta-button edit-profile" onClick={() => navigate("/app/me")}>Back</button>
      </div>
      <SectionHeader eyebrow="Real Admin" title="Back Office" description="Choose a workspace to manage platform operations." />

      <div className="bubble-card rounded-[32px] p-5 space-y-4">
        <button
          type="button"
          className="cta-button edit-profile w-full"
          onClick={() => navigate("/realadmin/accounts")}
        >
          Account Verification
        </button>
      </div>
    </div>
  );
}
