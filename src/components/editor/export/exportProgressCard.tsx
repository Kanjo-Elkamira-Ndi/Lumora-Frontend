"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FileVideo2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAiUiStore } from "@/stores/aiUiStore";
import { cn } from "@/lib/utils/cn";
import { toastSuccess } from "@/lib/utils/toast";

export function ExportProgressCard() {
  const progressOpen = useAiUiStore((s) => s.progressOpen);
  const setProgressOpen = useAiUiStore((s) => s.setProgressOpen);
  const [progress, setProgress] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const done = progress >= 100;

  if (progressOpen !== wasOpen) {
    setWasOpen(progressOpen);
    if (progressOpen) {
      setProgress(0);
      setCollapsed(false);
    }
  }

  useEffect(() => {
    if (progressOpen) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = Math.min(100, prev + Math.floor(Math.random() * 10) + 6);
          return next;
        });
      }, 550);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [progressOpen]);

  useEffect(() => {
    if (done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      toastSuccess("Export complete");
    }
  }, [done]);

  if (!progressOpen) return null;

  return (
    <div className="fixed right-6 top-[72px] z-50 w-[340px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <FileVideo2 size={16} className="text-[var(--color-primary)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">
            {done ? "Export complete" : "Exporting project…"}
          </p>
          <p className="truncate text-xs text-[var(--color-text-muted)]">
            lumora-export-final.mp4
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
                    console.log("View in Assets — mock");
                  }}
                >
                  View in Assets
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Progress value={progress} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {progress}%
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
