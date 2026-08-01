"use client";

import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editorStore";
import type { Layer } from "@/types";

const TYPE_TOP_BORDER: Record<Layer["type"], string> = {
  video: "#3B82F6",
  audio: "#22C55E",
  text: "#A855F7",
  effect: "#FF6A1A",
};

export function LayerChip({
  layer,
  containerWidth,
  totalDuration,
}: {
  layer: Layer;
  containerWidth: number;
  totalDuration: number;
}) {
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selected = selectedLayerId === layer.id;
  const width = (layer.durationMs / 1000 / totalDuration) * containerWidth;
  const left = (layer.startMs / 1000 / totalDuration) * containerWidth;

  return (
    <button
      type="button"
      aria-label={`Layer: ${layer.label}`}
      onClick={() => selectLayer(layer.id)}
      className={cn(
        "absolute top-0 h-[var(--layer-height)] overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-3)] text-left transition-shadow",
        selected && "ring-1 ring-[#FF6A1A] ring-inset"
      )}
      style={{ width, left }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: TYPE_TOP_BORDER[layer.type] }}
      />
      <div className="flex h-full items-center gap-1.5 pl-2 pr-1">
        {layer.source !== "manual" && (
          <span
            className={cn(
              "shrink-0 rounded-sm px-1 text-[8px] font-bold leading-4 tracking-widest",
              layer.source === "genblaze_generated"
                ? "bg-[rgba(255,106,26,0.15)] text-[#FF6A1A]"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
            )}
          >
            {layer.source === "genblaze_generated" ? "GEN" : "AI"}
          </span>
        )}
        <span className="truncate text-xs text-white">{layer.label}</span>
      </div>
    </button>
  );
}
