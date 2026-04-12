import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function PageContainer({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8", className)}>{children}</div>;
}
