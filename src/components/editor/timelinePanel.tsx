"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { Playhead } from "./timeline/playhead";
import { TimeRuler } from "./timeline/timeRuler";
import { TrackRow } from "./timeline/trackRow";

const TOTAL_SECONDS = 30;

export function TimelinePanel() {
  const timeline = useTimelineStore((s) => s.timeline);
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const tracks = timeline?.tracks ?? [];
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);

  useEffect(() => {
    const content = contentRef.current;
    if (content) setContainerWidth(content.offsetWidth);
    const spacer = spacerRef.current;
    if (spacer) setLabelWidth(spacer.offsetWidth);
  }, []);

  return (
    <footer className="flex min-h-0 flex-col border-t border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <div className="flex h-10 shrink-0 items-center justify-end gap-1 border-b border-[var(--color-border)] px-4">
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom out"
          onClick={() => console.log("Zoom out — mock")}
        >
          <ZoomOut size={18} />
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Zoom in"
          onClick={() => console.log("Zoom in — mock")}
        >
          <ZoomIn size={18} />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
        <div className="flex shrink-0">
          <div ref={spacerRef} className="w-20 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-2)]" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <TimeRuler totalDuration={TOTAL_SECONDS} />
          </div>
        </div>
        <div ref={contentRef} className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                totalDuration={TOTAL_SECONDS}
              />
            ))}
          </div>
          <Playhead
            containerWidth={containerWidth}
            labelWidth={labelWidth}
            position={playheadPosition}
            totalDuration={TOTAL_SECONDS}
          />
        </div>
      </div>
    </footer>
  );
}
