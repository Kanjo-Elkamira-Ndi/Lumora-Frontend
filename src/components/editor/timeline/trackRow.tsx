"use client";

import { useEffect, useRef, useState } from "react";
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
  totalDuration,
  onShowProvenance,
}: {
  track: Track;
  totalDuration: number;
  onShowProvenance?: (layer: Layer) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const Icon = TRACK_ICONS[track.type];

  useEffect(() => {
    const el = contentRef.current;
    if (el) setContainerWidth(el.offsetWidth);
  }, [track]);

  return (
    <div className="flex h-[var(--layer-height)] border-b border-[var(--color-border)]">
      <div className="flex w-20 shrink-0 items-center gap-2 border-r border-[var(--color-border)] bg-[var(--color-surface-2)] px-3">
        <Icon className="size-3.5 shrink-0 text-[var(--color-text-muted)]" />
        <span className="truncate text-xs text-[var(--color-text-muted)]">
          {track.name}
        </span>
      </div>
      <div ref={contentRef} className="relative min-w-0 flex-1 overflow-hidden">
        {track.layers.map((layer) => (
          <LayerChip
            key={layer.id}
            layer={layer}
            containerWidth={containerWidth}
            totalDuration={totalDuration}
            onShowProvenance={onShowProvenance}
          />
        ))}
      </div>
    </div>
  );
}
