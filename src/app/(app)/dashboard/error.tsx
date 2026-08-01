"use client";

import { ErrorBanner } from "@/components/ui/errorBanner";

export default function DashboardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-8 pb-10 pt-8">
      <h1 className="mb-3 text-xl font-bold text-white">
        Couldn&apos;t load projects
      </h1>
      <div className="max-w-md">
        <ErrorBanner
          message={error.message || "An unexpected error occurred."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
