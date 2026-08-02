"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  FileVideo2,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getJob,
  type JobDto,
  type JobWsMessage,
  subscribeToJob,
} from "@/lib/api/jobs";
import { cn } from "@/lib/utils/cn";
import { useAiUiStore } from "@/stores/aiUiStore";

export function ExportProgressCard() {
  const progressOpen = useAiUiStore((s) => s.progressOpen);
  const setProgressOpen = useAiUiStore((s) => s.setProgressOpen);
  const renderJobId = useAiUiStore((s) => s.renderJobId);
  const router = useRouter();
  const [job, setJob] = useState<JobDto | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!progressOpen || !renderJobId) return;
    let cancelled = false;

    getJob(renderJobId)
      .then((dto) => {
        if (!cancelled) setJob(dto);
      })
      .catch(() => {
        // keep pending fallback until a WS update or poll succeeds
      });

    const onMessage = (message: JobWsMessage) => {
      if (cancelled) return;
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: message.status,
              result: message.result ?? prev.result,
              error: message.error ?? prev.error,
            }
          : {
              id: renderJobId,
              projectId: "",
              tier: 2,
              jobType: "render",
              prompt: "",
              status: message.status,
              result: message.result ?? null,
              error: message.error ?? null,
              attempts: 0,
              maxAttempts: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
      );
    };
    const unsubscribe = subscribeToJob(renderJobId, onMessage);
    const poll = setInterval(() => {
      getJob(renderJobId)
        .then((dto) => {
          if (!cancelled) setJob(dto);
        })
        .catch(() => {
          // keep last known state
        });
    }, 3000);

    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(poll);
    };
  }, [progressOpen, renderJobId]);

  if (!progressOpen) return null;

  const status = job?.status ?? "pending";
  const running = status === "pending" || status === "running";
  const done = status === "completed";
  const failed = status === "failed";
  const filename =
    job?.result?.asset && typeof job.result.asset === "object"
      ? ((job.result.asset as Record<string, unknown>).b2Key as string | undefined)?.split("/").pop()
      : "lumora-export-final.mp4";

  return (
    <div className="fixed right-6 top-[72px] z-50 w-[340px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-3">
        {running ? (
          <Loader2
            size={16}
            className="animate-spin text-[var(--color-primary)]"
          />
        ) : (
          <FileVideo2 size={16} className="text-[var(--color-primary)]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">
            {done
              ? "Export complete"
              : failed
                ? "Export failed"
                : "Exporting project…"}
          </p>
          <p className="truncate text-xs text-[var(--color-text-muted)]">
            {filename ?? "lumora-export-final.mp4"}
          </p>
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expand" : "Collapse"}
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-white"
        >
          <ChevronDown
            size={16}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setProgressOpen(false)}
          className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          {done ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-[var(--color-success)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Ready in your asset library.
                </span>
              </div>
              <div className="flex justify-end">
                <Button
                  size="default"
                  onClick={() => {
                    setProgressOpen(false);
                    router.push("/assets");
                  }}
                >
                  View in Assets
                </Button>
              </div>
            </div>
          ) : failed ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                {job?.error ?? "Render failed. Try again."}
              </p>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setProgressOpen(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--color-primary)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {status === "pending" ? "Queued…" : "Rendering…"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-[var(--color-error)]"
                  onClick={() => setProgressOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
