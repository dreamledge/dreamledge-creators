import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[999px] border border-white/10 bg-zinc-900/75 px-5 py-3.5 text-sm font-medium text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:border-white/20 hover:bg-zinc-800/85",
        className,
      )}
      {...props}
    />
  );
}
