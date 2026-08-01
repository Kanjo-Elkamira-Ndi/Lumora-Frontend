"use client";

import { useEffect, useRef, useState } from "react";
import { Film, Maximize2, Pause, Play, Volume2 } from "lucide-react";

import { useEditorStore } from "@/stores/editorStore";

const TOTAL_SECONDS = 30;

function formatTimecode(seconds: number) {
  const s = Math.max(0, Math.min(seconds, TOTAL_SECONDS));
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export function PreviewPanel() {
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const setPlayheadPosition = useEditorStore((s) => s.setPlayheadPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setPlayheadPosition((prev) => Math.min(prev + 0.1, TOTAL_SECONDS));
    }, 100);
  };

  return (
    <section className="flex min-w-0 flex-col overflow-hidden bg-black">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Film size={48} className="text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          No video loaded
        </p>
      </div>

      <div className="flex h-12 shrink-0 items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-4">
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlayback}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <input
          type="range"
          min={0}
          max={TOTAL_SECONDS}
          step={0.1}
          value={playheadPosition}
          onChange={(e) => setPlayheadPosition(parseFloat(e.target.value))}
          aria-label="Scrub timeline"
          className="min-w-0 flex-1 cursor-pointer accent-[#FF6A1A]"
        />

        <span className="w-24 shrink-0 text-right font-mono text-xs text-[var(--color-text-muted)]">
          {formatTimecode(playheadPosition)} / {formatTimecode(TOTAL_SECONDS)}
        </span>

        <button
          type="button"
          aria-label="Volume"
          onClick={() => console.log("Volume — mock")}
          className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          <Volume2 size={18} />
        </button>

        <button
          type="button"
          aria-label="Fullscreen"
          onClick={() => console.log("Fullscreen — mock")}
          className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </section>
  );
}
