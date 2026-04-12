import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { LoadingState } from "@/components/ui/LoadingState";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function OnboardingGate() {
  const { user } = useAuth();
  if (user && !user.onboardingComplete) return <Navigate to="/signup" replace />;
  return <Outlet />;
}
