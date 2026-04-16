import { cn } from "@/lib/utils/cn";

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-label="Verified user" className={cn("verified-label__icon", className)}>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="M8.55 12.95 5.9 10.3l1.05-1.05 1.6 1.6 4.5-4.5 1.05 1.05-5.55 5.55Z"
        fill="white"
      />
    </svg>
  );
}

export function VerifiedLabel({
  text,
  verified,
  className,
  textClassName,
  iconClassName,
}: {
  text: string;
  verified?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("verified-label", className)}>
      <span className={cn("verified-label__text", textClassName)}>{text}</span>
      {verified ? <VerifiedBadge className={iconClassName} /> : null}
    </span>
  );
}
