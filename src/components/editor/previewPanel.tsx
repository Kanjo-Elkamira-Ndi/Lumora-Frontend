"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Film,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import { getAssetUrl } from "@/lib/api/assets";
import { toastError } from "@/lib/utils/toast";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Layer, Timeline } from "@/types";

const FALLBACK_SECONDS = 30;

type ActiveClip = {
  layer: Layer;
  startMs: number;
  durationMs: number;
};

type LoadedMedia = {
  assetId: string;
  url: string;
  duration?: number;
};

function formatTimecode(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

function resolveActiveClip(
  timeline: Timeline | null,
  playheadSec: number
): ActiveClip | null {
  if (!timeline) return null;
  const t = playheadSec * 1000;
  for (const trackType of ["video", "audio"] as const) {
    const track = timeline.tracks.find((tr) => tr.type === trackType);
    if (!track) continue;
    const layer = track.layers.find(
      (l) => l.assetId && t >= l.startMs && t < l.startMs + l.durationMs
    );
    if (layer) return { layer, startMs: layer.startMs, durationMs: layer.durationMs };
  }
  return null;
}

export function PreviewPanel() {
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const setPlayheadPosition = useEditorStore((s) => s.setPlayheadPosition);
  const timeline = useTimelineStore((s) => s.timeline);

  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [media, setMedia] = useState<LoadedMedia | null>(null);
  const [mediaError, setMediaError] = useState<{
    assetId: string;
    message: string;
  } | null>(null);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSeconds = timeline ? timeline.durationMs / 1000 : FALLBACK_SECONDS;

  const activeClip = useMemo(
    () => resolveActiveClip(timeline, playheadPosition),
    [timeline, playheadPosition]
  );

  const assetId = activeClip?.layer.assetId;
  const currentMedia = media && media.assetId === assetId ? media : null;
  const currentMediaUrl = currentMedia?.url;
  const activeStartMs = activeClip?.startMs;
  const currentError =
    mediaError && mediaError.assetId === assetId ? mediaError.message : null;
  const loading = Boolean(assetId) && !currentMedia && !currentError;

  const mediaDuration =
    currentMedia?.duration ??
    (activeClip ? activeClip.durationMs / 1000 : undefined) ??
    totalSeconds;
  const mediaPosition =
    activeClip && currentMedia
      ? Math.min(
          mediaDuration,
          Math.max(0, playheadPosition - (activeStartMs ?? 0) / 1000)
        )
      : playheadPosition;

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    getAssetUrl(assetId)
      .then(({ url }) => {
        if (!cancelled) setMedia({ assetId, url });
      })
      .catch(() => {
        if (!cancelled) {
          setMediaError({
            assetId,
            message: "Could not load media for this clip",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  useEffect(() => {
    const mediaEl = mediaRef.current;
    if (!mediaEl || !currentMediaUrl) return;
    const playheadSec = useEditorStore.getState().playheadPosition;
    const target = Math.max(0, playheadSec - (activeStartMs ?? 0) / 1000);
    if (mediaEl.duration && Math.abs(mediaEl.currentTime - target) > 0.15) {
      mediaEl.currentTime = target;
    }
    if (isPlaying && mediaEl.paused) {
      void mediaEl.play().catch(() => {
        setIsPlaying(false);
        toastError("Playback failed");
      });
    }
    if (!isPlaying && !mediaEl.paused) {
      mediaEl.pause();
    }
  }, [activeClip?.layer.id, activeStartMs, currentMediaUrl, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    let raf: number;
    const tick = () => {
      const mediaEl = mediaRef.current;
      const clip = resolveActiveClip(
        useTimelineStore.getState().timeline,
        useEditorStore.getState().playheadPosition
      );
      if (mediaEl && clip) {
        const tSec = clip.startMs / 1000 + mediaEl.currentTime;
        const endSec = (clip.startMs + clip.durationMs) / 1000;
        if (tSec >= endSec) {
          setPlayheadPosition(endSec);
          setIsPlaying(false);
          mediaEl.pause();
          return;
        }
        setPlayheadPosition(tSec);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, setPlayheadPosition]);

  const togglePlayback = () => {
    if (!activeClip) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const mediaEl = mediaRef.current;
    if (!mediaEl || !currentMediaUrl) return;
    void mediaEl
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => toastError("Playback failed"));
  };

  const handleScrub = (value: number) => {
    setPlayheadPosition(value);
    const mediaEl = mediaRef.current;
    if (mediaEl && activeClip) {
      mediaEl.currentTime = Math.max(0, (value - activeClip.startMs) / 1000);
    }
  };

  const toggleMute = () => {
    const mediaEl = mediaRef.current;
    const next = !muted;
    setMuted(next);
    if (mediaEl) mediaEl.muted = next;
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      void document.exitFullscreen();
      return;
    }
    void containerRef.current?.requestFullscreen().catch(() => undefined);
  };

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <section
      ref={containerRef}
      className="flex min-w-0 flex-col overflow-hidden bg-black"
    >
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
        {currentMedia && (
          <video
            key={currentMedia.assetId}
            ref={mediaRef}
            src={currentMedia.url}
            className="max-h-full max-w-full object-contain"
            playsInline
            preload="metadata"
            muted={muted}
            onLoadedMetadata={(e) => {
              const duration = e.currentTarget.duration;
              const id = currentMedia.assetId;
              setMedia((m) =>
                m && m.assetId === id ? { ...m, duration } : m
              );
            }}
            onError={() => {
              setMediaError({
                assetId: currentMedia.assetId,
                message: "Could not load media for this clip",
              });
            }}
          />
        )}

        {!currentMedia && !currentError && (
          <>
            {loading ? (
              <Loader2 size={40} className="animate-spin text-[var(--color-text-muted)]" />
            ) : (
              <Film size={48} className="text-[var(--color-text-muted)]" />
            )}
            <p className="text-sm text-[var(--color-text-muted)]">
              {loading
                ? "Loading media…"
                : activeClip
                  ? "No media available for this clip"
                  : "No video loaded"}
            </p>
          </>
        )}

        {currentError && (
          <div className="flex flex-col items-center gap-2">
            <Film size={48} className="text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">{currentError}</p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white/80">
          {formatTimecode(mediaPosition)} / {formatTimecode(mediaDuration)}
        </div>
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
          max={totalSeconds}
          step={0.1}
          value={Math.min(playheadPosition, totalSeconds)}
          onChange={(e) => handleScrub(parseFloat(e.target.value))}
          aria-label="Scrub timeline"
          className="min-w-0 flex-1 cursor-pointer accent-[#FF6A1A]"
        />

        <span className="w-24 shrink-0 text-right font-mono text-xs text-[var(--color-text-muted)]">
          {formatTimecode(playheadPosition)} / {formatTimecode(totalSeconds)}
        </span>

        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={toggleMute}
          className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          type="button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
          className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </section>
  );
}
