import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/forms/AuthForm";
import { ProfileSetupForm } from "@/components/forms/ProfileSetupForm";

export function SignupPage() {
  const { signup, user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  return (
    <PageContainer className="flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-xl space-y-6 bubble-card rounded-[40px] p-6">
        {!user || user.onboardingComplete ? <AuthForm title="Create your creator account" buttonLabel="Create Account" includeName onSubmit={({ email, displayName }) => signup(email, displayName)} /> : null}
        {user && !user.onboardingComplete ? <ProfileSetupForm onComplete={() => { completeOnboarding(); navigate("/app/home"); }} /> : null}
      </div>
    </PageContainer>
  );
}
