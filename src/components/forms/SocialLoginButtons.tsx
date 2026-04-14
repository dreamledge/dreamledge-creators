import { Button } from "@/components/ui/Button";

export function SocialLoginButtons({ label = "Continue with Google", className = "w-full" }: { label?: string; className?: string }) {
  return (
    <Button type="button" className={className}>
      <span className="inline-flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12Z" />
          <path fill="#4285F4" d="M3.6 7.6l3.2 2.3c.9-1.8 2.8-3 5.2-3 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5c-3.7 0-6.9 2.1-8.4 5.1Z" />
          <path fill="#FBBC05" d="M2.5 12c0 1.5.4 2.9 1.1 4.2l3.7-2.9c-.2-.5-.4-.9-.4-1.3s.1-.9.4-1.3L3.6 7.6A9.4 9.4 0 0 0 2.5 12Z" />
          <path fill="#34A853" d="M12 21.5c2.5 0 4.6-.8 6.1-2.3l-3-2.3c-.8.6-1.8 1.1-3.1 1.1-2.4 0-4.4-1.6-5.2-3.8l-3.7 2.9c1.5 3 4.6 4.4 8.9 4.4Z" />
        </svg>
        <span>{label}</span>
      </span>
    </Button>
  );
}
