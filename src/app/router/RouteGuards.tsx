import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { LoadingState } from "@/components/ui/LoadingState";

export function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (currentUser) return <Navigate to="/app/home" replace />;
  return <Outlet />;
}
