import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordPage() {
  return (
    <PageContainer className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md bubble-card rounded-[40px] p-6">
        <h1 className="text-3xl font-semibold text-text-primary">Reset password</h1>
        <p className="mt-2 text-text-secondary">Firebase-ready reset flow scaffold for the prototype.</p>
        <input placeholder="Email" className="mt-5 w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3" />
        <Button className="mt-4 w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white">Send reset link</Button>
      </div>
    </PageContainer>
  );
}
