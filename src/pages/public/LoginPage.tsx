import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/forms/AuthForm";
import { SocialLoginButtons } from "@/components/forms/SocialLoginButtons";

function mapSignInError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/wrong-password":
        return "The password is incorrect.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Unable to sign in right now. Please try again.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Unable to sign in right now. Please try again.";
}

export function LoginPage() {
  const { signIn, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!loading && currentUser) {
    return <Navigate to="/app/home" replace />;
  }

  const handleSubmit = async ({ email, password }: { email: string; password: string; displayName: string; username: string }) => {
    setErrorMessage("");
    setSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
      navigate("/app/home", { replace: true });
    } catch (error) {
      setErrorMessage(mapSignInError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md bubble-card rounded-[40px] p-6">
        <AuthForm
          title="Sign in to compete"
          buttonLabel="Sign In"
          animatedSubmit
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          errorMessage={errorMessage}
        />
        <div className="my-4 h-px bg-white/10" />
        <SocialLoginButtons />
      </div>
    </PageContainer>
  );
}
