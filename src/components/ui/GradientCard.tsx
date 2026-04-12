import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function GradientCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("bubble-card rounded-[38px] p-5", className)}>
      {children}
    </div>
  );
}
