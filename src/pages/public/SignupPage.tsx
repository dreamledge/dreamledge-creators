import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/forms/AuthForm";
import { PostSignupAnimation } from "@/components/overlays/PostSignupAnimation";

export function SignupPage() {
  const { signup } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationUsername, setAnimationUsername] = useState("");

  const handleSignup = (values: { email: string; password: string; displayName: string; username: string }) => {
    signup(values.email, values.displayName, values.username);
    setAnimationUsername(values.username);
    setShowAnimation(true);
  };

  return (
    <PageContainer className="flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-xl space-y-6">
        {showAnimation ? (
          <PostSignupAnimation username={animationUsername} />
        ) : (
          <div className="dreamledge-signup-shell mx-auto max-w-sm">
            <AuthForm
              title="Create your creator account"
              buttonLabel="Sign up"
              includeName
              signupCard
              onSubmit={handleSignup}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
