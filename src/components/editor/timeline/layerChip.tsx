"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Layer } from "@/types";

const TYPE_TOP_BORDER: Record<Layer["type"], string> = {
  video: "#3B82F6",
  audio: "#22C55E",
  text: "#A855F7",
  effect: "#FF6A1A",
};

const MIN_PX_WIDTH = 4;
const HANDLE_WIDTH = 8;

type ResizeRef = {
  trackId: string;
  layerId: string;
  edge: "left" | "right";
  startX: number;
  startMs: number;
  durationMs: number;
  pxPerSec: number;
  minDurationMs: number;
  lastStartMs: number;
  lastDurationMs: number;
};

export function LayerChip({
  trackId,
  layer,
  pxPerSec,
  onShowProvenance,
}: {
  trackId: string;
  layer: Layer;
  pxPerSec: number;
  onShowProvenance?: (layer: Layer) => void;
}) {
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selected = selectedLayerId === layer.id;
  const width = Math.max((layer.durationMs / 1000) * pxPerSec, MIN_PX_WIDTH);
  const left = (layer.startMs / 1000) * pxPerSec;
  const resizeRef = useRef<ResizeRef | null>(null);

  const handleResizeMove = useCallback((e: PointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    const deltaMs = (e.clientX - r.startX) * (1000 / r.pxPerSec);
    if (r.edge === "right") {
      const durationMs = Math.max(r.minDurationMs, r.durationMs + deltaMs);
      r.lastDurationMs = durationMs;
      useTimelineStore
        .getState()
        .updateLayerLocal(r.trackId, r.layerId, { durationMs });
    } else {
      let startMs = Math.max(0, r.startMs + deltaMs);
      startMs = Math.min(startMs, r.startMs + r.durationMs - r.minDurationMs);
      const durationMs = r.durationMs + (r.startMs - startMs);
      r.lastStartMs = startMs;
      r.lastDurationMs = durationMs;
      useTimelineStore
        .getState()
        .updateLayerLocal(r.trackId, r.layerId, { startMs, durationMs });
    }
  }, []);

  const handleResizeUp = useCallback(() => {
    const r = resizeRef.current;
    resizeRef.current = null;
    if (!r) return;
    useTimelineStore.getState().updateLayerOptimistic(r.trackId, r.layerId, {
      startMs: r.lastStartMs,
      durationMs: r.lastDurationMs,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeUp);
    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeUp);
    };
  }, [handleResizeMove, handleResizeUp]);

  const startResize = useCallback(
    (edge: "left" | "right", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      selectLayer(layer.id);
      resizeRef.current = {
        trackId,
        layerId: layer.id,
        edge,
        startX: e.clientX,
        startMs: layer.startMs,
        durationMs: layer.durationMs,
        pxPerSec,
        minDurationMs: (MIN_PX_WIDTH / pxPerSec) * 1000,
        lastStartMs: layer.startMs,
        lastDurationMs: layer.durationMs,
      };
    },
    [
      trackId,
      layer.id,
      layer.startMs,
      layer.durationMs,
      pxPerSec,
      selectLayer,
    ]
  );

  return (
    <button
      type="button"
      draggable
      aria-label={`Layer: ${layer.label}`}
      title={layer.label}
      onClick={() => selectLayer(layer.id)}
      onContextMenu={(e) => {
        if (onShowProvenance) {
          e.preventDefault();
          onShowProvenance(layer);
        }
      }}
      onDragStart={(e) => {
        if (resizeRef.current) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            action: "move-layer",
            trackId,
            layerId: layer.id,
          })
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        window.dispatchEvent(new CustomEvent("lumora:drag-end"));
      }}
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
      <span
        aria-hidden="true"
        onPointerDown={(e) => startResize("left", e)}
        className="absolute inset-y-0 left-0 z-10 cursor-ew-resize"
        style={{ width: HANDLE_WIDTH }}
      />
      <span
        aria-hidden="true"
        onPointerDown={(e) => startResize("right", e)}
        className="absolute inset-y-0 right-0 z-10 cursor-ew-resize"
        style={{ width: HANDLE_WIDTH }}
      />
    </button>
  );
}
