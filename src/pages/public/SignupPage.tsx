import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/forms/AuthForm";
import { PostSignupAnimation } from "@/components/overlays/PostSignupAnimation";

function mapSignUpError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      case "auth/email-already-in-use":
        return "This email is already in use. Please sign in instead.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Unable to create account right now. Please try again.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Unable to create account right now. Please try again.";
}

export function SignupPage() {
  const { signUp } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationUsername, setAnimationUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (values: { email: string; password: string; displayName: string; username: string }) => {
    setErrorMessage("");
    setSubmitting(true);

    try {
      await signUp({
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName,
        username: values.username,
      });
      setAnimationUsername(values.username || values.displayName || values.email.split("@")[0] || "creator");
      setShowAnimation(true);
    } catch (error) {
      setErrorMessage(mapSignUpError(error));
    } finally {
      setSubmitting(false);
    }
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
              isSubmitting={submitting}
              errorMessage={errorMessage}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
