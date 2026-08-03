"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Music,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { Tier1Modal } from "@/components/editor/ai/tier1Modal";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/errorBanner";
import { Input } from "@/components/ui/input";
import { getAssetUrl, importAsset } from "@/lib/api/assets";
import { subscribeToJob } from "@/lib/api/jobs";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { useAiUiStore } from "@/stores/aiUiStore";
import { useAssetStore } from "@/stores/assetStore";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Asset } from "@/types";

const THUMB_BG = "#14532D";
const THUMB_ICON_COLOR = "#22C55E";

function formatDuration(durationMs?: number) {
  if (!durationMs) return "0:00";
  const s = Math.round(durationMs / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function AudioTab() {
  const assets = useAssetStore((s) => s.assets);
  const loading = useAssetStore((s) => s.loading);
  const error = useAssetStore((s) => s.error);
  const loadAssets = useAssetStore((s) => s.loadAssets);
  const addImportedAsset = useAssetStore((s) => s.addImportedAsset);
  const setAssetTags = useAssetStore((s) => s.setAssetTags);
  const removeAsset = useAssetStore((s) => s.removeAsset);
  const projectId = useEditorStore((s) => s.projectId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [tagEditingId, setTagEditingId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [importing, setImporting] = useState(false);
  const [tier1Open, setTier1Open] = useState(false);

  const audioAssets = assets.filter((a) => a.kind === "audio");
  const filtered = audioAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    if (projectId) void loadAssets(projectId);
  }, [projectId, loadAssets]);

  const addTag = async (asset: Asset, value: string) => {
    const tag = value.trim().replace(/\s+/g, "-");
    if (!tag) return;
    if (!(asset.tags ?? []).includes(tag)) {
      await setAssetTags(asset.id, [...(asset.tags ?? []), tag]);
    }
    setTagEditingId(null);
    setTagDraft("");
  };

  const removeTag = async (asset: Asset, tag: string) => {
    await setAssetTags(
      asset.id,
      (asset.tags ?? []).filter((t) => t !== tag)
    );
  };

  const handleDelete = async (asset: Asset) => {
    if (!window.confirm(`Delete “${asset.name}”? This cannot be undone.`)) {
      return;
    }
    try {
      await removeAsset(asset.id);
      toastSuccess("Asset deleted");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to delete asset");
    }
  };

  const addToTimeline = (asset: Asset) => {
    useTimelineStore.getState().addAssetLayer(asset, 0);
  };

  const togglePlay = async (asset: Asset) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === asset.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.pause();
    setPlayingId(null);
    const token = ++playTokenRef.current;
    try {
      const { url } = await getAssetUrl(asset.id);
      if (token !== playTokenRef.current) return;
      audio.src = url;
      await audio.play();
      if (token === playTokenRef.current) setPlayingId(asset.id);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to play audio");
    }
  };

  const importFiles = async (files: File[]) => {
    if (!projectId || importing) return;
    const audio = files.filter((file) => file.type.startsWith("audio/"));
    if (audio.length === 0) {
      toastError("Only audio files can be imported");
      return;
    }
    setImporting(true);
    try {
      let imported = 0;
      for (const file of audio) {
        try {
          const created = await importAsset(projectId, "audio", file);
          addImportedAsset({
            id: created.id,
            name: file.name,
            kind: "audio",
            url: "",
            durationMs: created.duration
              ? Math.round(created.duration * 1000)
              : undefined,
            mimeType: created.mimeType,
            source: "upload",
          });
          imported += 1;
        } catch (err) {
          toastError(
            err instanceof Error ? err.message : `Failed to import ${file.name}`
          );
        }
      }
      if (imported > 0) {
        toastSuccess(
          imported === 1 ? "Audio imported" : `${imported} audio files imported`
        );
      }
    } finally {
      setImporting(false);
    }
  };

  const activeJob = useAiUiStore((s) => s.activeJob);

  useEffect(() => {
    if (
      !activeJob ||
      (activeJob.kind !== "voiceover" && activeJob.kind !== "music")
    ) {
      return;
    }
    let disposed = false;
    const unsubscribe = subscribeToJob(activeJob.jobId, (msg) => {
      if (disposed) return;
      if (msg.status === "completed" && projectId) {
        void loadAssets(projectId);
      }
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [activeJob, projectId, loadAssets]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio..."
            className="h-9 pl-9 pr-12 text-xs"
          />
        </div>

        <div className="mb-3 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFiles([file]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {importing ? "Importing…" : "Import audio"}
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setTier1Open(true)}
          >
            <Sparkles size={14} />
            Generate with AI
          </Button>
        </div>

        {error && (
          <div className="mb-3">
            <ErrorBanner
              message={error}
              onRetry={() => {
                if (projectId) void loadAssets(projectId);
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-[var(--color-text-muted)]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                role="button"
                tabIndex={0}
                draggable
                onClick={() => addToTimeline(asset)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addToTimeline(asset);
                  }
                }}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      assetId: asset.id,
                      kind: asset.kind,
                      name: asset.name,
                      durationMs: asset.durationMs,
                    })
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onDragEnd={() => {
                  window.dispatchEvent(new CustomEvent("lumora:drag-end"));
                }}
                className="cursor-grab overflow-hidden rounded-lg bg-[#26262A] transition-colors duration-150 hover:bg-[#303036] active:cursor-grabbing"
              >
                <div
                  className="relative flex aspect-video items-center justify-center"
                  style={{ backgroundColor: THUMB_BG }}
                >
                  <Music size={20} style={{ color: THUMB_ICON_COLOR }} />
                  <button
                    type="button"
                    aria-label={
                      playingId === asset.id ? "Pause audio" : "Play audio"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      void togglePlay(asset);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="absolute inset-0 m-auto flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    {playingId === asset.id ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} className="ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-white">{asset.name}</p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatDuration(asset.durationMs)}
                    </p>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label="Add tag"
                        onClick={() => {
                          setTagEditingId(
                            tagEditingId === asset.id ? null : asset.id
                          );
                          setTagDraft("");
                        }}
                        className="cursor-pointer rounded p-1 text-[var(--color-text-muted)] transition-colors hover:text-white"
                      >
                        <Tag size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete asset"
                        onClick={() => void handleDelete(asset)}
                        className="cursor-pointer rounded p-1 text-[var(--color-text-muted)] transition-colors hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {(asset.tags ?? []).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {asset.tags!.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                        >
                          <span className="truncate">{tag}</span>
                          <button
                            type="button"
                            aria-label={`Remove tag ${tag}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              void removeTag(asset, tag);
                            }}
                            className="shrink-0 cursor-pointer rounded-full text-[var(--color-text-muted)] hover:text-white"
                          >
                            <X size={8} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {tagEditingId === asset.id && (
                    <div
                      className="mt-1.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        autoFocus
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        placeholder="Add tag…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void addTag(asset, tagDraft);
                          } else if (e.key === "Escape") {
                            setTagEditingId(null);
                            setTagDraft("");
                          }
                        }}
                        className="h-7 pl-2 pr-2 text-[11px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10">
            <p className="text-sm text-[var(--color-text-muted)]">
              {searchQuery
                ? `No audio matches “${searchQuery}”`
                : "No audio yet — import or generate audio to get started."}
            </p>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setPlayingId(null)}
      />

      <Tier1Modal open={tier1Open} onOpenChange={setTier1Open} />
    </div>
  );
}
