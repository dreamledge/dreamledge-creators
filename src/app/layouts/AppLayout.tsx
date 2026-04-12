import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";

export function AppLayout() {
  return (
    <AppShell>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </AppShell>
  );
}
