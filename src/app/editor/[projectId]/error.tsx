"use client";

import { ErrorBanner } from "@/components/ui/errorBanner";

export default function EditorErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="w-full max-w-md">
        <h1 className="mb-3 text-xl font-bold text-white">
          Something went wrong in the editor
        </h1>
        <ErrorBanner
          message={error.message || "An unexpected error occurred."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
