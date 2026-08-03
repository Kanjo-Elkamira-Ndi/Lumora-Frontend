"use client";

"use client";

import { Film, Music, Sparkles, Type, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Layer, Track } from "@/types";
import { LayerChip } from "./layerChip";

const TRACK_ICONS: Record<Track["type"], LucideIcon> = {
  video: Film,
  audio: Music,
  text: Type,
  effect: Sparkles,
};

export function TrackRow({
  track,
  pxPerSec,
  onShowProvenance,
  dropTarget = false,
}: {
  track: Track;
  pxPerSec: number;
  onShowProvenance?: (layer: Layer) => void;
  dropTarget?: boolean;
}) {
  const Icon = TRACK_ICONS[track.type];

  return (
    <div
      data-track-id={track.id}
      className={cn(
        "relative flex h-[var(--layer-height)] border-b border-[var(--color-border)]",
        dropTarget && "bg-[rgba(255,106,26,0.06)]"
      )}
    >
      <div className="sticky left-0 z-20 flex w-20 shrink-0 items-center gap-2 border-r border-[var(--color-border)] bg-[var(--color-surface-2)] px-3">
        <Icon className="size-3.5 shrink-0 text-[var(--color-text-muted)]" />
        <span className="truncate text-xs text-[var(--color-text-muted)]">
          {track.name}
        </span>
      </div>
      <div className="relative min-w-0 flex-1">
        {track.layers.map((layer) => (
          <LayerChip
            key={layer.id}
            trackId={track.id}
            layer={layer}
            pxPerSec={pxPerSec}
            onShowProvenance={onShowProvenance}
          />
        ))}
        {dropTarget && (
          <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-10 rounded-sm ring-1 ring-inset ring-[#FF6A1A]" />
        )}
      </div>
    </div>
  );
}
