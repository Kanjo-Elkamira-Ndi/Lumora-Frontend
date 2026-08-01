import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#FF6A1A] bg-[var(--color-surface-2)] p-4">
      <AlertCircle className="size-4 shrink-0 text-[#FF6A1A]" />
      <p className="flex-1 text-sm text-[var(--color-text-muted)]">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
