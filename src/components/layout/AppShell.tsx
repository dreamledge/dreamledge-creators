import type { PropsWithChildren } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { CyberBottomNav } from "@/components/layout/CyberBottomNav";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen app-backdrop page-grid">
      <div className="mx-auto flex max-w-7xl gap-6 px-0 lg:px-8">
        <DesktopSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <CyberBottomNav />
    </div>
  );
}
