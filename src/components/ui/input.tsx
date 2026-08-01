import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors duration-150 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,106,26,0.25)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
