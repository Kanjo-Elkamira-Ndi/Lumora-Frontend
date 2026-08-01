"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MOCK_JOB_COMPLETE, MOCK_JOB_ESCALATED } from "@/lib/mock/jobs";
import { cn } from "@/lib/utils/cn";
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

export function AgenticProgressDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mockState, setMockState] = useState<"complete" | "escalated">(
    "complete"
  );
  const setProgressOpen = useAiUiStore((s) => s.setProgressOpen);

  useEffect(() => {
    setProgressOpen(open);
  }, [open, setProgressOpen]);

  const job = mockState === "complete" ? MOCK_JOB_COMPLETE : MOCK_JOB_ESCALATED;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-none overflow-y-auto p-5"
      >
        <div className="flex items-center justify-end gap-2 text-xs text-[var(--color-text-muted)]">
          <span>Dev: {job.id}</span>
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
              <Button
                className="w-full"
                onClick={() => {
                  console.log("Accept voiceover — mock");
                  useTimelineStore.getState().addLayer("trk_audio", {
                    id: `lyr_ai_vo_${Date.now()}`,
                    type: "audio",
                    label: "Voiceover — AI Generated",
                    source: "genblaze_generated",
                    startMs: 0,
                    durationMs: 12000,
                    props: { volume: 80 },
                  });
                  onOpenChange(false);
                }}
              >
                Accept &amp; add to timeline
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => console.log("Regenerate — mock")}
              >
                Regenerate
              </Button>
            </div>
          </>
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
              can accept it as-is, edit your prompt and retry, or upload your
              own file instead.
            </p>

            <ResultPreviewCard />

            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full border border-[var(--color-border)]"
                onClick={() => {
                  console.log("Accept escalated — mock");
                  onOpenChange(false);
                }}
              >
                Accept best attempt
              </Button>
              <Button
                variant="secondary"
                className="w-full border border-[var(--color-border)]"
                onClick={() => {
                  console.log("Retry — mock");
                  onOpenChange(false);
                }}
              >
                Edit prompt &amp; retry
              </Button>
              <Button
                variant="secondary"
                className="w-full border border-[var(--color-border)]"
                onClick={() => console.log("Upload manual — mock")}
              >
                Upload file instead
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
