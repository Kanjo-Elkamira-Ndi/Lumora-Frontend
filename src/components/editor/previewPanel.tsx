"use client";

import type React from "react";
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

type ActiveTextLayer = {
  layer: Layer;
  trackId: string;
  startMs: number;
  durationMs: number;
};

type VideoBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function resolveActiveTextLayers(
  timeline: Timeline | null,
  playheadSec: number
): ActiveTextLayer[] {
  if (!timeline) return [];
  const t = playheadSec * 1000;
  const track = timeline.tracks.find((tr) => tr.type === "text");
  if (!track) return [];
  return track.layers
    .filter((l) => t >= l.startMs && t < l.startMs + l.durationMs)
    .map((l) => ({ layer: l, trackId: track.id, startMs: l.startMs, durationMs: l.durationMs }));
}

function posFromProps(props?: Record<string, unknown>): { x: number; y: number } {
  const p = props?.position;
  if (typeof p === "object" && p !== null) {
    const { x, y } = p as Record<string, number>;
    return { x: Number(x ?? 0.5), y: Number(y ?? 0.9) };
  }
  return { x: 0.5, y: 0.9 };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

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

  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [media, setMedia] = useState<LoadedMedia | null>(null);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const [mediaError, setMediaError] = useState<{
    assetId: string;
    message: string;
  } | null>(null);

  const totalSeconds = timeline ? timeline.durationMs / 1000 : FALLBACK_SECONDS;

  const activeClip = useMemo(
    () => resolveActiveClip(timeline, playheadPosition),
    [timeline, playheadPosition]
  );

  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);

  const activeTextLayers = useMemo(
    () => resolveActiveTextLayers(timeline, playheadPosition),
    [timeline, playheadPosition]
  );

  const [videoBox, setVideoBox] = useState<VideoBox | null>(null);
  const [drag, setDrag] = useState<{
    layer: Layer;
    trackId: string;
    x: number;
    y: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const [editing, setEditing] = useState<{ layer: Layer; trackId: string } | null>(null);

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
        setPlaying(false);
        toastError("Playback failed");
      });
    }
    if (!isPlaying && !mediaEl.paused) {
      mediaEl.pause();
    }
  }, [activeClip?.layer.id, activeStartMs, currentMediaUrl, isPlaying, setPlaying]);

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
          setPlaying(false);
          mediaEl.pause();
          return;
        }
        setPlayheadPosition(tSec);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, setPlayheadPosition, setPlaying]);

  const togglePlayback = () => {
    if (!activeClip) return;
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    const mediaEl = mediaRef.current;
    if (!mediaEl || !currentMediaUrl) return;
    void mediaEl
      .play()
      .then(() => setPlaying(true))
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

  const scale = videoBox ? videoBox.width / 1920 : 1;

  const handleOverlayPointerDown = (
    e: React.PointerEvent,
    layer: Layer,
    trackId: string
  ) => {
    if (editing?.layer.id === layer.id) return;
    e.stopPropagation();
    selectLayer(layer.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = posFromProps(layer.props);
    setDrag({
      layer,
      trackId,
      x: pos.x,
      y: pos.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
    });
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    if (!drag || !videoBox) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    const x = clamp(drag.x + dx / videoBox.width, 0, 1);
    const y = clamp(drag.y + dy / videoBox.height, 0, 1);
    setDrag({ ...drag, x, y });
  };

  const handleOverlayPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { layer, trackId, x, y } = drag;
    setDrag(null);
    useTimelineStore.getState().updateLayerOptimistic(trackId, layer.id, {
      props: { ...layer.props, position: { x, y } },
    });
  };

  const commitEdit = (trackId: string, layer: Layer, value: string) => {
    setEditing(null);
    useTimelineStore.getState().updateLayerOptimistic(trackId, layer.id, {
      label: value.slice(0, 60) || "Text",
      props: { ...layer.props, content: value },
    });
  };

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const measure = () => {
      const mediaEl = mediaRef.current;
      const containerEl = containerRef.current;
      if (!mediaEl || !containerEl) return;
      const m = mediaEl.getBoundingClientRect();
      const c = containerEl.getBoundingClientRect();
      setVideoBox({
        left: m.left - c.left,
        top: m.top - c.top,
        width: m.width,
        height: m.height,
      });
    };
    const ro = new ResizeObserver(measure);
    if (mediaRef.current) ro.observe(mediaRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    measure();
    return () => ro.disconnect();
  }, [currentMediaUrl]);

  return (
    <section
      ref={containerRef}
      className="flex min-w-0 flex-col overflow-hidden bg-black"
    >
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
        {currentMedia && (
          <div className="relative">
            <video
              key={currentMedia.assetId}
              ref={mediaRef}
              src={currentMedia.url}
              className="block max-h-full max-w-full object-contain"
              playsInline
              preload="metadata"
              muted={muted}
              onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                const id = currentMedia.assetId;
                setMedia((m) =>
                  m && m.assetId === id ? { ...m, duration } : m
                );
                const m = mediaRef.current;
                const c = containerRef.current;
                if (m && c) {
                  const mr = m.getBoundingClientRect();
                  const cr = c.getBoundingClientRect();
                  setVideoBox({
                    left: mr.left - cr.left,
                    top: mr.top - cr.top,
                    width: mr.width,
                    height: mr.height,
                  });
                }
              }}
              onError={() => {
                setMediaError({
                  assetId: currentMedia.assetId,
                  message: "Could not load media for this clip",
                });
              }}
            />

            {videoBox && activeTextLayers.length > 0 && (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: videoBox.left,
                  top: videoBox.top,
                  width: videoBox.width,
                  height: videoBox.height,
                }}
              >
                {activeTextLayers.map(({ layer, trackId }) => {
                  const pos = posFromProps(layer.props);
                  const isEditing = editing?.layer.id === layer.id;
                  const live = drag && drag.layer.id === layer.id
                    ? { x: drag.x, y: drag.y }
                    : pos;
                  const content = String(layer.props?.content ?? "");
                  const size = Number(layer.props?.size ?? 48);
                  const opacity = Number(layer.props?.opacity ?? 1);
                  const rotation = Number(layer.props?.rotation ?? 0);
                  const outlineWidth = Number(layer.props?.outlineWidth ?? 0);
                  const outlineColor = String(layer.props?.outlineColor ?? "black");
                  const shadowX = Number(layer.props?.shadowX ?? 0);
                  const shadowY = Number(layer.props?.shadowY ?? 0);
                  const shadowColor = String(layer.props?.shadowColor ?? "black");
                  const box = Boolean(layer.props?.box);
                  const boxColor = String(layer.props?.boxColor ?? "black");
                  const boxBorderW = Number(layer.props?.boxBorderW ?? 8);
                  const selected = selectedLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      className="pointer-events-auto absolute cursor-move select-none"
                      style={{
                        left: `${live.x * 100}%`,
                        top: `${live.y * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        fontSize: `${(size * scale).toFixed(1)}px`,
                        lineHeight: 1.2,
                        color: String(layer.props?.color ?? "#FFFFFF"),
                        whiteSpace: "pre",
                        opacity,
                        WebkitTextStroke:
                          outlineWidth > 0
                            ? `${outlineWidth * scale}px ${outlineColor}`
                            : undefined,
                        textShadow:
                          shadowX !== 0 || shadowY !== 0
                            ? `${shadowX * scale}px ${shadowY * scale}px 0 ${shadowColor}`
                            : undefined,
                        backgroundColor: box ? boxColor : undefined,
                        padding: box ? `${boxBorderW * scale}px` : undefined,
                        outline: selected ? "1px dashed #FF6A1A" : undefined,
                        outlineOffset: "2px",
                      }}
                      onPointerDown={(e) =>
                        handleOverlayPointerDown(e, layer, trackId)
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onDoubleClick={() => setEditing({ layer, trackId })}
                    >
                      {isEditing ? (
                        <textarea
                          autoFocus
                          defaultValue={content}
                          onBlur={(e) =>
                            commitEdit(trackId, layer, e.currentTarget.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                            if (e.key === "Escape") {
                              e.currentTarget.value = content;
                              e.currentTarget.blur();
                            }
                          }}
                          className="min-w-[160px] resize-none bg-transparent text-center focus:outline-none"
                          style={{ color: "inherit", font: "inherit", lineHeight: 1.2 }}
                        />
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
