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
      <div className="w-full max-w-xl space-y-6">
        {!user || user.onboardingComplete ? <div className="dreamledge-signup-shell mx-auto max-w-sm"><AuthForm title="Create your creator account" buttonLabel="Sign up" includeName signupCard onSubmit={({ email, displayName, username }) => signup(email, displayName, username)} /></div> : null}
        {user && !user.onboardingComplete ? <ProfileSetupForm onComplete={() => { completeOnboarding(); navigate("/app/home"); }} /> : null}
      </div>
    </PageContainer>
  );
}
