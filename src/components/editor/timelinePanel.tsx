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

export function TimelinePanel() {
  const timeline = useTimelineStore((s) => s.timeline);
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const tracks = timeline?.tracks ?? [];
  const totalDuration = timeline ? timeline.durationMs / 1000 : TOTAL_SECONDS;
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);
  const [manifestLayer, setManifestLayer] = useState<Layer | null>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (content) setContainerWidth(content.offsetWidth);
    const spacer = spacerRef.current;
    if (spacer) setLabelWidth(spacer.offsetWidth);
  }, []);

  const hasLayers = tracks.some((track) => track.layers.length > 0);

  return (
    <footer className="flex min-h-0 flex-col border-t border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <div className="flex h-10 shrink-0 items-center justify-end gap-1 border-b border-[var(--color-border)] px-4">
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom out"
          onClick={() => {
            /* todo: timeline zoom is UI-only */
          }}
        >
          <ZoomOut size={18} />
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom in"
          onClick={() => {
            /* todo: timeline zoom is UI-only */
          }}
        >
          <ZoomIn size={18} />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
        <div className="flex shrink-0">
          <div ref={spacerRef} className="w-20 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-2)]" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <TimeRuler totalDuration={totalDuration} />
          </div>
        </div>
        <div ref={contentRef} className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            {!hasLayers ? (
              <EmptyState
                icon={Sparkles}
                title="Nothing on your timeline yet"
                description="Add clips, voiceover, and AI-generation from the AI Assist tab to get started."
                actionLabel="Open AI Assist"
                onAction={() => {
                  window.dispatchEvent(new CustomEvent("lumora:open-ai-assist"));
                }}
              />
            ) : (
              tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  totalDuration={totalDuration}
                  onShowProvenance={(layer) => setManifestLayer(layer)}
                />
              ))
            )}
          </div>
          <Playhead
            containerWidth={containerWidth}
            labelWidth={labelWidth}
            position={playheadPosition}
            totalDuration={totalDuration}
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
