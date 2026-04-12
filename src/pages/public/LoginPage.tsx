import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/forms/AuthForm";
import { SocialLoginButtons } from "@/components/forms/SocialLoginButtons";

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user?.onboardingComplete) {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <PageContainer className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md bubble-card rounded-[40px] p-6">
        <AuthForm title="Sign in to compete" buttonLabel="Sign In" onSubmit={({ email }) => { login(email); navigate("/app/home"); }} />
        <div className="my-4 h-px bg-white/10" />
        <SocialLoginButtons />
      </div>
    </PageContainer>
  );
}
