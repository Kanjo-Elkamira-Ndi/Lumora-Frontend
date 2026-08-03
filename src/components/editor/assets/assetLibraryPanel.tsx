"use client";

import { useEffect, useRef, useState } from "react";
import {
  Film,
  Image as ImageIcon,
  Loader2,
  Music,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/errorBanner";
import { importAsset } from "@/lib/api/assets";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import { useAssetStore } from "@/stores/assetStore";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Asset, AssetKind } from "@/types";
import { AiAssistTab } from "@/components/editor/ai/aiAssistTab";
import { TextTab } from "@/components/editor/assets/textTab";
import { AudioTab } from "@/components/editor/assets/audioTab";

const TABS = [
  { id: "media", label: "Media" },
  { id: "text", label: "Text" },
  { id: "audio", label: "Audio" },
  { id: "ai-assist", label: "AI Assist" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const THUMB_BG: Record<AssetKind, string> = {
  video: "#1E3A5F",
  audio: "#14532D",
  image: "#3B0764",
};

const THUMB_ICON: Record<AssetKind, typeof Film> = {
  video: Film,
  audio: Music,
  image: ImageIcon,
};

const THUMB_ICON_COLOR: Record<AssetKind, string> = {
  video: "#3B82F6",
  audio: "#22C55E",
  image: "#A855F7",
};

function formatDuration(durationMs?: number) {
  if (!durationMs) return "0:00";
  const s = Math.round(durationMs / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function AssetLibraryPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("media");
  const assets = useAssetStore((s) => s.assets);
  const loading = useAssetStore((s) => s.loading);
  const error = useAssetStore((s) => s.error);
  const searchQuery = useAssetStore((s) => s.searchQuery);
  const setSearchQuery = useAssetStore((s) => s.setSearchQuery);
  const loadAssets = useAssetStore((s) => s.loadAssets);
  const addImportedAsset = useAssetStore((s) => s.addImportedAsset);
  const setAssetTags = useAssetStore((s) => s.setAssetTags);
  const removeAsset = useAssetStore((s) => s.removeAsset);
  const projectId = useEditorStore((s) => s.projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagEditingId, setTagEditingId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [importing, setImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  useEffect(() => {
    if (projectId) void loadAssets(projectId);
  }, [projectId, loadAssets]);

  useEffect(() => {
    const openAiAssist = () => setActiveTab("ai-assist");
    window.addEventListener("lumora:open-ai-assist", openAiAssist);
    return () => window.removeEventListener("lumora:open-ai-assist", openAiAssist);
  }, []);

  const filtered = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const addToTimeline = (asset: Asset) => {
    useTimelineStore.getState().addAssetLayer(asset, 0);
  };

  const importFiles = async (files: File[]) => {
    if (!projectId || importing) return;
    const media = files.filter((file) => /^(video\/|audio\/|image\/)/.test(file.type));
    if (media.length === 0) {
      toastError("Only video, audio, or image files can be imported");
      return;
    }
    setImporting(true);
    try {
      let imported = 0;
      for (const file of media) {
        const kind = file.type.startsWith("audio/")
          ? "audio"
          : file.type.startsWith("image/")
            ? "image"
            : "video";
        try {
          const created = await importAsset(projectId, kind, file);
          addImportedAsset({
            id: created.id,
            name: file.name,
            kind,
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
          imported === 1 ? "Asset imported" : `${imported} assets imported`
        );
      }
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    void importFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-[var(--color-surface-1)]">
      <div className="flex shrink-0 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 cursor-pointer py-3 text-center text-xs font-medium transition-colors duration-150",
              activeTab === tab.id
                ? "border-b-2 border-[var(--color-primary)] text-white"
                : "border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "media" && (
        <div
          className="relative flex-1 overflow-y-auto p-3"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-surface-1)]/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-primary)] px-8 py-6 text-center">
                <Upload className="size-5 text-[var(--color-primary)]" />
                <p className="text-xs font-medium text-white">Drop to import media</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Video, audio, or image files
                </p>
              </div>
            </div>
          )}

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="h-9 pl-9 pr-12 text-xs"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*,image/*"
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
            className="mb-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {importing ? "Importing…" : "Import media"}
          </button>

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
              {filtered.map((asset) => {
                const Icon = THUMB_ICON[asset.kind];
                return (
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
                      window.dispatchEvent(
                        new CustomEvent("lumora:drag-end")
                      );
                    }}
                    className="cursor-grab overflow-hidden rounded-lg bg-[#26262A] transition-colors duration-150 hover:bg-[#303036] active:cursor-grabbing"
                  >
                    <div
                      className="flex aspect-video items-center justify-center"
                      style={{ backgroundColor: THUMB_BG[asset.kind] }}
                    >
                      <Icon size={20} style={{ color: THUMB_ICON_COLOR[asset.kind] }} />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs text-white">{asset.name}</p>
                      <div className="mt-0.5 flex items-center justify-between">
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {asset.kind === "image" ? "IMG" : formatDuration(asset.durationMs)}
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
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10">
              <p className="text-sm text-[var(--color-text-muted)]">
                {searchQuery
                  ? `No assets match “${searchQuery}”`
                  : "No assets yet — import media to get started."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "text" && <TextTab />}
      {activeTab === "audio" && <AudioTab />}
      {activeTab === "ai-assist" && <AiAssistTab />}
    </aside>
  );
}
