"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptyState";
import { AssetManifestDrawer } from "@/components/editor/assets/assetManifestDrawer";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { Playhead } from "./timeline/playhead";
import { TimeRuler } from "./timeline/timeRuler";
import { TrackRow } from "./timeline/trackRow";
import type { Layer } from "@/types";

const TOTAL_SECONDS = 30;
const LABEL_WIDTH = 80;
const MIN_PX_PER_SEC = 1;
const MAX_PX_PER_SEC = 400;
const INITIAL_MAX_PX_PER_SEC = 200;
const ZOOM_STEP = 1.35;

const sliderToPx = (value: number) =>
  MIN_PX_PER_SEC * Math.pow(MAX_PX_PER_SEC / MIN_PX_PER_SEC, value / 100);

const pxToSlider = (px: number) =>
  (Math.log(px / MIN_PX_PER_SEC) /
    Math.log(MAX_PX_PER_SEC / MIN_PX_PER_SEC)) *
  100;

export function TimelinePanel() {
  const timeline = useTimelineStore((s) => s.timeline);
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const tracks = timeline?.tracks ?? [];
  const totalDuration = timeline ? timeline.durationMs / 1000 : TOTAL_SECONDS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pxPerSec, setPxPerSec] = useState<number | null>(null);
  const [fitPxPerSec, setFitPxPerSec] = useState(20);
  const [manifestLayer, setManifestLayer] = useState<Layer | null>(null);

  const timelineId = timeline?.id;
  const [fitZoomTimelineId, setFitZoomTimelineId] = useState<
    string | undefined
  >(undefined);

  if (pxPerSec != null && timelineId !== fitZoomTimelineId) {
    setFitZoomTimelineId(timelineId);
    setPxPerSec(null);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const fit = Math.min(
        INITIAL_MAX_PX_PER_SEC,
        Math.max(MIN_PX_PER_SEC, (el.clientWidth - LABEL_WIDTH) / totalDuration)
      );
      setFitPxPerSec(fit);
      setPxPerSec((prev) => (prev == null ? fit : prev));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [timelineId, totalDuration]);

  const activePxPerSec = pxPerSec ?? fitPxPerSec;

  useEffect(() => {
    if (!isPlaying || pxPerSec == null) return;
    const el = scrollRef.current;
    if (!el) return;
    const targetX = LABEL_WIDTH + playheadPosition * pxPerSec;
    const leftOverflow = targetX - el.scrollLeft;
    const rightOverflow = targetX - (el.scrollLeft + el.clientWidth);
    if (leftOverflow < 0) {
      el.scrollLeft = Math.max(0, targetX - el.clientWidth / 2);
    } else if (rightOverflow > 0) {
      el.scrollLeft = targetX - el.clientWidth / 2;
    }
  }, [isPlaying, playheadPosition, pxPerSec]);

  const hasLayers = tracks.some((track) => track.layers.length > 0);
  const zoomPercent = Math.round((activePxPerSec / fitPxPerSec) * 100);

  return (
    <footer className="flex min-h-0 min-w-0 flex-col border-t border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <div className="flex h-10 shrink-0 items-center justify-end gap-1 border-b border-[var(--color-border)] px-4">
        <span className="mr-1 w-11 text-right font-mono text-xs text-[var(--color-text-muted)]">
          {zoomPercent}%
        </span>
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom out"
          onClick={() =>
            setPxPerSec(
              Math.max(MIN_PX_PER_SEC, activePxPerSec / ZOOM_STEP)
            )
          }
        >
          <ZoomOut size={18} />
        </Button>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pxToSlider(activePxPerSec)}
          onChange={(e) => setPxPerSec(sliderToPx(parseFloat(e.target.value)))}
          aria-label="Timeline zoom"
          className="w-28 cursor-pointer accent-[#FF6A1A]"
        />
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom in"
          onClick={() =>
            setPxPerSec(
              Math.min(MAX_PX_PER_SEC, activePxPerSec * ZOOM_STEP)
            )
          }
        >
          <ZoomIn size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPxPerSec(fitPxPerSec)}
        >
          Fit
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto"
      >
        <div
          className="relative min-w-full"
          style={{ width: LABEL_WIDTH + totalDuration * activePxPerSec }}
        >
          <div className="sticky top-0 z-30 flex h-7 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div className="sticky left-0 z-30 w-20 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-2)]" />
            <TimeRuler totalDuration={totalDuration} pxPerSec={activePxPerSec} />
          </div>

          {!hasLayers ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <EmptyState
                icon={Sparkles}
                title="Nothing on your timeline yet"
                description="Add clips, voiceover, and AI-generation from the AI Assist tab to get started."
                actionLabel="Open AI Assist"
                onAction={() => {
                  window.dispatchEvent(
                    new CustomEvent("lumora:open-ai-assist")
                  );
                }}
              />
            </div>
          ) : (
            tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                pxPerSec={activePxPerSec}
                onShowProvenance={(layer) => setManifestLayer(layer)}
              />
            ))
          )}

          <Playhead
            labelWidth={LABEL_WIDTH}
            position={playheadPosition}
            pxPerSec={activePxPerSec}
          />
        </div>
      </div>

      <AssetManifestDrawer
        key={manifestLayer?.id ?? "none"}
        open={manifestLayer !== null}
        onOpenChange={(open) => {
          if (!open) setManifestLayer(null);
        }}
        layer={manifestLayer}
      />
    </footer>
  );
}
