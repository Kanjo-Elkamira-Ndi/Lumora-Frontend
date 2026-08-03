"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getJob, type JobDto, type JobWsMessage, subscribeToJob } from "@/lib/api/jobs";
import { cn } from "@/lib/utils/cn";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { useAiUiStore } from "@/stores/aiUiStore";
import { useTimelineStore } from "@/stores/timelineStore";

type AgenticRunDto = {
  score: number;
  decision: "store" | "retry" | "escalate";
  checks: { name: string; passed: boolean; score: number; detail: string }[];
};

function RunningView({ job }: { job: JobDto }) {
  const title =
    job.jobType === "agentic"
      ? "Generating & validating voiceover…"
      : job.jobType === "music"
        ? "Generating music…"
        : job.jobType === "image"
          ? "Generating image…"
          : job.jobType === "video"
            ? "Generating video…"
            : "Generating voiceover…";

  const detail =
    job.jobType === "agentic"
      ? "Running quality checks (duration, ASR roundtrip, silence)…"
      : "Generating with GMI Cloud…";

  return (
    <>
      <div className="flex items-center gap-2">
        <Loader2
          size={18}
          className="animate-spin text-[var(--color-primary)]"
        />
        <SheetTitle className="text-base">{title}</SheetTitle>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--color-primary)]" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {job.status === "pending" ? "Queued…" : detail}
        </p>
        {job.jobType === "agentic" && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Attempt {Math.min(job.attempts + 1, job.maxAttempts)} of{" "}
            {job.maxAttempts}
          </p>
        )}
      </div>
    </>
  );
}

function CheckItem({
  name,
  passed,
  score,
  detail,
}: AgenticRunDto["checks"][number]) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
          passed
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-error)]"
        )}
      >
        {passed ? (
          <Check size={10} className="text-[var(--color-surface-1)]" />
        ) : (
          <X size={10} className="text-[var(--color-surface-1)]" />
        )}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-white">{name}</span>
          <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
            {score.toFixed(2)}
          </span>
        </div>
        {detail && (
          <p className="text-[11px] text-[var(--color-text-muted)]">{detail}</p>
        )}
      </div>
    </div>
  );
}

function AttemptItem({
  index,
  run,
}: {
  index: number;
  run: AgenticRunDto;
}) {
  const passed = run.decision === "store";
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          passed
            ? "border-[rgba(34,197,94,0.4)] text-[var(--color-success)]"
            : "border-[var(--color-border)] text-[var(--color-text-muted)]"
        )}
      >
        <span className="text-xs">{index}</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-white">
            Attempt {index} — GMI Cloud
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-xs",
              passed
                ? "border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] text-[var(--color-success)]"
                : "border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.15)] text-[var(--color-error)]"
            )}
          >
            {passed ? "Passed ✓" : "Failed"}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {run.checks.map((check) => (
            <CheckItem key={check.name} {...check} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompleteView({
  job,
  onClose,
}: {
  job: JobDto;
  onClose: () => void;
}) {
  const result = (job.result ?? {}) as Record<string, unknown>;
  const asset = (result.asset ?? {}) as {
    id?: string;
    duration?: number;
  };
  const layerId = (result.layerId as string | null) ?? null;
  const runs = (result.runs ?? []) as AgenticRunDto[];
  const isAudio = job.jobType === "voiceover" || job.jobType === "music";
  const hasLayer = Boolean(layerId || asset.id);

  const handleAccept = () => {
    const timeline = useTimelineStore.getState().timeline;
    if (!timeline) {
      toastError("No timeline loaded");
      return;
    }
    if (layerId) {
      toastSuccess("Result already added to timeline");
      useAiUiStore.getState().setActiveJob(null);
      onClose();
      return;
    }
    const trackType = isAudio ? "audio" : "video";
    const track = timeline.tracks.find((t) => t.type === trackType);
    if (!track) {
      toastError(`No ${trackType} track available`);
      return;
    }
    const durationMs = (asset.duration ?? 12) * 1000;
    const label =
      job.jobType === "music"
        ? "Music — AI Generated"
        : job.jobType === "image"
          ? "Image — AI Generated"
          : job.jobType === "video"
            ? "Video — AI Generated"
            : "Voiceover — AI Generated";
    useTimelineStore.getState().addLayer(track.id, {
      id: `lyr_ai_${job.jobType}_${Date.now()}`,
      type: trackType,
      label,
      source: "genblaze_generated",
      startMs: 0,
      durationMs,
      assetId: asset.id,
      props: {
        assetId: asset.id,
        name: label,
        ...(isAudio ? { volume: 80 } : {}),
      },
    });
    toastSuccess("Result added to timeline");
    useAiUiStore.getState().setActiveJob(null);
    onClose();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <CheckCircle size={18} className="text-[var(--color-success)]" />
        <SheetTitle className="text-base">
          {job.jobType === "agentic" ? "Voiceover passed quality checks" : "Result ready"}
        </SheetTitle>
      </div>

      {runs.length > 0 ? (
        <div className="mt-5 flex flex-col gap-1">
          {runs.map((run, i) => (
            <div key={i} className="flex flex-col">
              {i > 0 && (
                <div className="ml-3.5 h-4 w-px bg-[var(--color-border)]" />
              )}
              <AttemptItem index={i + 1} run={run} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Generated {asset.duration ? `${asset.duration}s ` : ""}of{" "}
          {job.jobType} — review it below, then add it to the timeline.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Button className="w-full" onClick={handleAccept} disabled={!hasLayer}>
          Accept &amp; add to timeline
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => onClose()}
        >
          Close
        </Button>
      </div>
    </>
  );
}

function EscalatedView({
  job,
  onClose,
}: {
  job: JobDto;
  onClose: () => void;
}) {
  const result = (job.result ?? {}) as Record<string, unknown>;
  const runs = (result.runs ?? []) as AgenticRunDto[];

  return (
    <>
      <div className="flex items-center gap-2">
        <AlertTriangle
          size={18}
          className="text-[var(--color-primary)]"
        />
        <SheetTitle className="text-base">
          We couldn&apos;t get a passing result
        </SheetTitle>
      </div>

      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
        Every attempt failed its quality checks. Here&apos;s the best of{" "}
        {job.attempts} attempt{job.attempts === 1 ? "" : "s"} — you can accept
        it as-is, edit your prompt and retry, or upload your own file instead.
      </p>

      {runs.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          {runs.map((run, i) => (
            <div key={i} className="flex flex-col">
              {i > 0 && (
                <div className="ml-3.5 h-4 w-px bg-[var(--color-border)]" />
              )}
              <AttemptItem index={i + 1} run={run} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-full border border-[var(--color-border)]"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </>
  );
}

function ErrorView({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <AlertTriangle
          size={18}
          className="text-[var(--color-error)]"
        />
        <SheetTitle className="text-base">Generation failed</SheetTitle>
      </div>

      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {message}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  );
}

export function AgenticProgressDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activeJob = useAiUiStore((s) => s.activeJob);
  const [job, setJob] = useState<JobDto | null>(null);

  useEffect(() => {
    if (!open || !activeJob) return;
    let cancelled = false;

    getJob(activeJob.jobId)
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
              id: activeJob.jobId,
              projectId: "",
              tier: activeJob.kind === "agentic" ? 2 : 1,
              jobType: activeJob.kind,
              prompt: "",
              status: message.status,
              result: message.result ?? null,
              error: message.error ?? null,
              attempts: 0,
              maxAttempts: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
      );
    };
    const unsubscribe = subscribeToJob(activeJob.jobId, onMessage);
    const poll = setInterval(() => {
      getJob(activeJob.jobId)
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
  }, [open, activeJob]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const currentJob: JobDto | null = job ?? (activeJob ? {
    id: activeJob.jobId,
    projectId: "",
    tier: activeJob.kind === "agentic" ? 2 : 1,
    jobType: activeJob.kind,
    prompt: "",
    status: "pending",
    result: null,
    error: null,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null);

  const real = open && activeJob !== null && currentJob !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-none overflow-y-auto p-5"
      >
        {real && currentJob ? (
          currentJob.status === "completed" ? (
            (currentJob.result?.decision as string | undefined) === "escalate" ? (
              <EscalatedView job={currentJob} onClose={handleClose} />
            ) : (
              <CompleteView job={currentJob} onClose={handleClose} />
            )
          ) : currentJob.status === "failed" ? (
            <ErrorView
              message={currentJob.error ?? "Generation failed"}
              onClose={handleClose}
            />
          ) : (
            <RunningView job={currentJob} />
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Loader2
                size={18}
                className="animate-spin text-[var(--color-primary)]"
              />
              <SheetTitle className="text-base">Starting…</SheetTitle>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              No active generation job.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
