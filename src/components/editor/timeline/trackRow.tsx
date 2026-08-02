"use client";

import { Film, Music, Sparkles, Type, type LucideIcon } from "lucide-react";

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
}: {
  track: Track;
  pxPerSec: number;
  onShowProvenance?: (layer: Layer) => void;
}) {
  const Icon = TRACK_ICONS[track.type];

  return (
    <div className="flex h-[var(--layer-height)] border-b border-[var(--color-border)]">
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
            layer={layer}
            pxPerSec={pxPerSec}
            onShowProvenance={onShowProvenance}
          />
        ))}
      </div>
    </div>
  );
}
