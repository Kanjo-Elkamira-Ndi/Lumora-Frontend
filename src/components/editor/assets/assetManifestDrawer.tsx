"use client";

import { useEffect, useState } from "react";
import { Check, Film, Loader2, Lock, Music, Type } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getAssetManifest } from "@/lib/api/assets";
import { cn } from "@/lib/utils/cn";
import type { Layer } from "@/types";

const TYPE_ICON: Record<Layer["type"], typeof Film> = {
  video: Film,
  audio: Music,
  text: Type,
  effect: Film,
};

const TYPE_COLOR: Record<Layer["type"], string> = {
  video: "#3B82F6",
  audio: "#22C55E",
  text: "#A855F7",
  effect: "#FF6A1A",
};

const PROMPT =
  "A warm professional voiceover for our product demo";

const CHECKS = [
  "Duration ✓",
  "ASR match: 0.94 ✓",
  "Silence / clipping ✓",
];

const MANIFEST_JSON = (assetId: string) => `{
  "assetId": "${assetId}",
  "sha256": "a3f9c8...c12e",
  "b2Key": "generated-audio/proj_01/asset_001.mp3",
  "provider": "ElevenLabs",
  "attempt": 2,
  "manifestRef": "manifests/run_001.json"
}`;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

export function AssetManifestDrawer({
  open,
  onOpenChange,
  layer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layer: Layer | null;
}) {
  const [manifest, setManifest] = useState<{
    runId: string | null;
    data: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState(() => Boolean(open && layer?.assetId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !layer?.assetId) return;
    let active = true;
    getAssetManifest(layer.assetId).then(
      (res) => {
        if (!active) return;
        setLoading(false);
        setError(null);
        setManifest(res);
      },
      (err) => {
        if (!active) return;
        setLoading(false);
        setManifest(null);
        setError(
          err instanceof Error ? err.message : "Manifest not available"
        );
      }
    );
    return () => {
      active = false;
    };
  }, [open, layer?.assetId]);

  if (!layer) return null;

  const Icon = TYPE_ICON[layer.type];
  const assetId = layer.assetId ?? "asset_mock_001";
  const manifestText = loading
    ? "Loading manifest…"
    : error
      ? `// ${error}`
      : manifest
        ? JSON.stringify({ runId: manifest.runId, data: manifest.data }, null, 2)
        : MANIFEST_JSON(assetId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[460px] max-w-none sm:max-w-none overflow-y-auto gap-0 p-0"
      >
        <SheetTitle className="sr-only">Asset provenance</SheetTitle>
        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <div className="mb-4 flex aspect-video max-h-[120px] items-center justify-center rounded-lg bg-[var(--color-surface-3)]">
            <Icon size={40} style={{ color: TYPE_COLOR[layer.type] }} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="truncate text-base font-semibold text-white">
              {layer.label}
            </h2>
            <span className="shrink-0 rounded-full border border-[#FF6A1A] px-2.5 py-1 text-xs text-[#FF6A1A]">
              AI-generated
            </span>
          </div>
        </div>

        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <SectionLabel>Generation details</SectionLabel>
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-[var(--color-text-muted)]">
                Provider
              </span>
              <span className="text-sm text-white">ElevenLabs</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-[var(--color-text-muted)]">
                Prompt
              </span>
              <span className="max-w-[240px] truncate text-sm italic text-[var(--color-text-muted)]">
                {PROMPT}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-[var(--color-text-muted)]">
                Timestamp
              </span>
              <span className="font-mono text-xs text-white">
                Jul 31, 2026, 14:32 UTC
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <SectionLabel>Evaluation history</SectionLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <span className="text-xs text-[var(--color-text-muted)]">1</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    GMI Cloud
                  </span>
                  <span className="inline-flex rounded-full border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.15)] px-2 py-0.5 text-xs text-[var(--color-error)]">
                    Failed
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  ASR 0.61
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
                    ElevenLabs
                  </span>
                  <span className="inline-flex rounded-full border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] px-2 py-0.5 text-xs text-[var(--color-success)]">
                    Passed ✓
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {CHECKS.map((check) => (
                    <div key={check} className="flex items-center gap-2">
                      <Check
                        size={12}
                        className="text-[var(--color-success)]"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {check}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <SectionLabel>Manifest</SectionLabel>
          <div className="mb-4 flex items-center gap-2">
            <Lock size={14} className="text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              Provenance record locked (Object Lock enabled)
            </span>
          </div>
          <pre
            className={cn(
              "overflow-x-auto rounded-xl bg-[var(--color-surface-0)] p-4",
              "font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]"
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Loader2 className="size-3 animate-spin" /> Loading manifest…
              </span>
            ) : (
              manifestText
            )}
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}
