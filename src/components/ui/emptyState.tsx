import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <Icon className="size-12 text-[var(--color-text-muted)]" />
      <p className="mt-4 text-lg font-medium text-[var(--color-text-primary)]">
        {title}
      </p>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
