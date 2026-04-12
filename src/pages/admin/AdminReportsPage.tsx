import { mockReports } from "@/lib/constants/mockData";

export function AdminReportsPage() {
  return <div className="space-y-3">{mockReports.map((report) => <div key={report.id} className="rounded-[32px] border border-white/10 bg-card/90 p-4"><p className="font-semibold text-text-primary">{report.reason}</p><p className="mt-2 text-sm text-text-secondary">{report.details}</p></div>)}</div>;
}
