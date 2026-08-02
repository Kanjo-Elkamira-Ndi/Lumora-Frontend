"use client";

import { useEffect, useRef, useState } from "react";
import {
  Film,
  Image as ImageIcon,
  Loader2,
  Music,
  Plus,
  Search,
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

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
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
  const projectId = useEditorStore((s) => s.projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const resolveTrack = (asset: Asset) => {
    const timeline = useTimelineStore.getState().timeline;
    if (!timeline) return null;
    const kind = asset.kind === "audio" ? "audio" : "video";
    const track = timeline.tracks.find((t) => t.type === kind);
    if (!track) {
      toastError(`No ${kind} track available on this timeline`);
      return null;
    }
    return track;
  };

  const addToTimeline = (asset: Asset, layerId: string) => {
    const track = resolveTrack(asset);
    if (!track) return;
    useTimelineStore.getState().addLayer(track.id, {
      id: layerId,
      type: track.type,
      label: asset.name,
      source: "manual",
      startMs: 0,
      durationMs: asset.durationMs ?? 10000,
      assetId: asset.id,
      props: { assetId: asset.id, start: 0, name: asset.name },
    });
  };

  const handleImport = async (file: File) => {
    if (!projectId) return;
    const kind = file.type.startsWith("audio/")
      ? "audio"
      : file.type.startsWith("image/")
        ? "image"
        : "video";
    try {
      const created = await importAsset(projectId, kind, file);
      addImportedAsset({
        id: created.id,
        name: created.b2Key?.split("/").pop() ?? file.name,
        kind,
        url: "",
        durationMs: created.duration ? Math.round(created.duration * 1000) : undefined,
        mimeType: created.mimeType,
        source: "upload",
      });
      toastSuccess("Asset imported");
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : "Failed to import asset"
      );
    }
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
        <div className="flex-1 overflow-y-auto p-3">
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
              if (file) void handleImport(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <Plus size={14} />
            Import media
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
                    onClick={() => addToTimeline(asset, `tmp_${Date.now()}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        addToTimeline(asset, `tmp_${Date.now()}`);
                      }
                    }}
                    className="cursor-pointer overflow-hidden rounded-lg bg-[#26262A] transition-colors duration-150 hover:bg-[#303036]"
                  >
                    <div
                      className="flex aspect-video items-center justify-center"
                      style={{ backgroundColor: THUMB_BG[asset.kind] }}
                    >
                      <Icon size={20} style={{ color: THUMB_ICON_COLOR[asset.kind] }} />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs text-white">{asset.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {asset.kind === "image" ? "IMG" : formatDuration(asset.durationMs)}
                      </p>
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

      {activeTab === "text" && <EmptyTab label="Text overlays coming soon" />}
      {activeTab === "audio" && <EmptyTab label="Audio browser coming soon" />}
      {activeTab === "ai-assist" && <AiAssistTab />}
    </aside>
  );
}
