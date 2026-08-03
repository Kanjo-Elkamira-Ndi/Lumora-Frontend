"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

type Format = "mp4" | "webm";
type Preset = "1080p" | "720p" | "4K";
type Scale = "fit-width" | "fit-height" | "stretch";

const FORMATS: {
  id: Format;
  label: string;
  description: string;
  sub?: string;
  badge?: string;
}[] = [
  { id: "mp4", label: "MP4", description: "H.264", sub: "MPEG-4", badge: "Recommended" },
  { id: "webm", label: "WEBM", description: "VP9", sub: "WebM" },
];

const PRESETS: {
  id: Preset;
  label: string;
  sub: string;
  destination: string;
}[] = [
  { id: "1080p", label: "1080p", sub: "High quality", destination: "Instagram Reels / TikTok" },
  { id: "720p", label: "720p", sub: "Web optimized", destination: "YouTube / Web" },
  { id: "4K", label: "4K", sub: "Ultra HD", destination: "Cinema" },
];

const SCALES: { id: Scale; label: string; value: string }[] = [
  { id: "fit-width", label: "Fit width", value: "1920" },
  { id: "fit-height", label: "Fit height", value: "1080" },
  { id: "stretch", label: "Stretch", value: "1:1" },
];

function StepLabel({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
        {step}
      </span>
      <span className="text-sm font-medium text-white">{title}</span>
    </div>
  );
}

export function ExportModal({
  open,
  onOpenChange,
  onExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: Format) => void;
}) {
  const [format, setFormat] = useState<Format>("mp4");
  const [preset, setPreset] = useState<Preset>("1080p");
  const [scale, setScale] = useState<Scale>("fit-width");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] gap-0 p-0">
        <div className="flex items-center justify-between px-6 pb-5 pt-6">
          <DialogTitle>Export</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-white"
            >
              <X size={16} />
            </button>
          </DialogClose>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-6">
          <div>
            <StepLabel step={1} title="Format" />
            <div className="grid grid-cols-3 gap-2.5">
              {FORMATS.map((f) => {
                const selected = format === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "relative rounded-xl p-[1.5px] text-left transition-colors",
                      selected
                        ? "bg-gradient-to-b from-[#FF6A1A] to-[#C14E0E]"
                        : "bg-[var(--color-border)] hover:bg-[var(--color-border-strong)]"
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--color-primary)]" />
                    )}
                    <div className="flex h-full flex-col gap-1 rounded-[10px] bg-[var(--color-surface-0)] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {f.label}
                        </span>
                        {selected && (
                          <Check size={14} className="text-[var(--color-primary)]" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          selected
                            ? "italic text-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)]"
                        )}
                      >
                        {f.description}
                      </span>
                      {f.sub && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {f.sub}
                        </span>
                      )}
                      {f.badge && selected && (
                        <span className="mt-1 w-fit rounded-full bg-[rgba(255,106,26,0.15)] px-2 py-0.5 text-[10px] text-[var(--color-primary)]">
                          {f.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <StepLabel step={2} title="Presets" />
            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => {
                const selected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[var(--color-primary)] bg-[rgba(255,106,26,0.06)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    )}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          selected ? "text-[var(--color-primary)]" : "text-white"
                        )}
                      >
                        {p.label}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {p.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {p.destination}
                      </span>
                      <ChevronRight
                        size={16}
                        className={cn(
                          selected
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)]"
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <StepLabel step={3} title="Scale" />
            <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
              {SCALES.map((s, i) => {
                const selected = scale === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScale(s.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm transition-colors",
                      i !== 0 && "border-l border-[var(--color-border)]",
                      selected
                        ? "bg-[var(--color-surface-3)] font-medium text-white"
                        : "text-[var(--color-text-muted)] hover:text-white"
                    )}
                  >
                    <span>{s.label}</span>
                    <span
                      className={cn(
                        "text-xs",
                        selected
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-text-muted)]"
                      )}
                    >
                      {s.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-6 py-4">
          <span className="text-xs text-[var(--color-text-muted)]">
            {format === "webm" ? "VP9" : "H.264"} · 30 fps
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="default"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="default"
              className="rounded-lg font-medium"
              onClick={() => {
                onOpenChange(false);
                onExport(format);
              }}
            >
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
