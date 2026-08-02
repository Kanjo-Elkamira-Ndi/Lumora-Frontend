"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getJob, type JobDto, type JobWsMessage, subscribeToJob } from "@/lib/api/jobs";
import { cn } from "@/lib/utils/cn";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { useAiUiStore } from "@/stores/aiUiStore";
import { useTimelineStore } from "@/stores/timelineStore";

const WAVE_HEIGHTS = [
  "h-6", "h-3", "h-8", "h-4", "h-10", "h-2", "h-6", "h-4",
  "h-8", "h-3", "h-10", "h-4", "h-6", "h-2", "h-8", "h-3",
  "h-4", "h-6", "h-10", "h-3", "h-8", "h-4", "h-2", "h-6",
  "h-10", "h-3", "h-4", "h-8", "h-6", "h-2", "h-10", "h-4",
  "h-6", "h-3", "h-8", "h-4", "h-2", "h-6", "h-8", "h-3",
];

function ResultPreviewCard() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <p className="mb-3 text-xs text-[var(--color-text-muted)]">
        Result preview
      </p>
      <div className="flex h-12 items-center gap-0.5 overflow-hidden rounded-md bg-[var(--color-surface-3)] px-3">
        {WAVE_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className={cn("w-0.5 shrink-0 rounded-full bg-[#FF6A1A]", height)}
          />
        ))}
      </div>
      <input
        type="range"
        className="mt-3 w-full"
        style={{ accentColor: "#FF6A1A" }}
      />
    </div>
  );
}

function RunningView({ job }: { job: JobDto }) {
  const title =
    job.jobType === "music"
      ? "Generating music…"
      : job.jobType === "image"
        ? "Generating image…"
        : "Generating voiceover…";
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
          {job.status === "pending"
            ? "Queued…"
            : job.status === "running"
              ? "Generating with GMI Cloud…"
              : "Waiting…"}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Attempt {Math.min(job.attempts + 1, job.maxAttempts)} of{" "}
          {job.maxAttempts}
        </p>
      </div>
    </>
  );
}

function CompleteView({
  job,
  onClose,
}: {
  job: JobDto;
  onClose: () => void;
}) {
  const handleAccept = () => {
    const asset = (job.result?.asset ?? {}) as {
      id?: string;
      duration?: number;
    };
    const timeline = useTimelineStore.getState().timeline;
    const audioTrack = timeline?.tracks.find((t) => t.type === "audio");
    if (!audioTrack) {
      toastError("No audio track available");
      return;
    }
    const durationMs = (asset.duration ?? 12) * 1000;
    useTimelineStore.getState().addLayer(audioTrack.id, {
      id: `lyr_ai_vo_${Date.now()}`,
      type: "audio",
      label: "Voiceover — AI Generated",
      source: "genblaze_generated",
      startMs: 0,
      durationMs,
      assetId: asset.id,
      props: {
        assetId: asset.id,
        volume: 80,
        name: "Voiceover — AI Generated",
      },
    });
    toastSuccess("Voiceover added to timeline");
    useAiUiStore.getState().setActiveJob(null);
    onClose();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <CheckCircle size={18} className="text-[var(--color-success)]" />
        <SheetTitle className="text-base">Voiceover ready</SheetTitle>
      </div>

      <div className="mt-1 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <span className="text-xs text-[var(--color-text-muted)]">1</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">
                Attempt 1 — GMI Cloud
              </span>
              <span className="inline-flex rounded-full border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.15)] px-2 py-0.5 text-xs text-[var(--color-error)]">
                Failed
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              ASR mismatch (0.61 confidence)
            </p>
          </div>
        </div>

        <div className="ml-3.5 h-4 w-px bg-[var(--color-border)]" />

        <div className="flex items-start gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-surface-2)]">
            <span className="text-xs text-[var(--color-primary)]">2</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">
                Attempt 2 — ElevenLabs
              </span>
              <span className="inline-flex rounded-full border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] px-2 py-0.5 text-xs text-[var(--color-success)]">
                Passed ✓
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {["Duration ✓", "ASR match: 0.94 ✓", "Silence / clipping ✓"].map(
                (check) => (
                  <div key={check} className="flex items-center gap-2">
                    <Check
                      size={12}
                      className="text-[var(--color-success)]"
                    />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {check}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <ResultPreviewCard />
        <Button className="w-full" onClick={handleAccept}>
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
  const [mockState, setMockState] = useState<"complete" | "escalated">(
    "complete"
  );

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
              tier: 1,
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
    tier: 1,
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
            <CompleteView job={currentJob} onClose={handleClose} />
          ) : currentJob.status === "failed" ? (
            <ErrorView
              message={currentJob.error ?? "Generation failed"}
              onClose={handleClose}
            />
          ) : (
            <RunningView job={currentJob} />
          )
        ) : (
          <>
            <div className="flex items-center justify-end gap-2 text-xs text-[var(--color-text-muted)]">
              <span>Dev: {activeJob ? activeJob.jobId : "mock"}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setMockState("complete")}
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setMockState("escalated")}
              >
                Escalated
              </Button>
            </div>

            {mockState === "complete" ? (
              <CompleteView
                job={{
                  id: activeJob?.jobId ?? "job_dev_complete",
                  projectId: "",
                  tier: 1,
                  jobType: "voiceover",
                  prompt: "",
                  status: "completed",
                  result: { asset: { duration: 12 } },
                  error: null,
                  attempts: 2,
                  maxAttempts: 3,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
                onClose={handleClose}
              />
            ) : (
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
                  Here&apos;s the best attempt (Attempt 3, Stability Audio). You
                  can accept it as-is, edit your prompt and retry, or upload
                  your own file instead.
                </p>

                <ResultPreviewCard />

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    className="w-full border border-[var(--color-border)]"
                    onClick={() => {
                      /* todo: dev-only escalation view; accept = add layer from job result */
                      handleClose();
                    }}
                  >
                    Accept best attempt
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full border border-[var(--color-border)]"
                    onClick={() => {
                      /* todo: reopen tier1 modal to edit prompt and retry */
                      handleClose();
                    }}
                  >
                    Edit prompt &amp; retry
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full border border-[var(--color-border)]"
                    onClick={() => {
                      /* todo: B2 not configured; no manual upload endpoint wired */
                    }}
                  >
                    Upload file instead
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
