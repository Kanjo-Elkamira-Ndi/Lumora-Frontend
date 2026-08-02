"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Film,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Music,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/ui/emptyState";
import { ErrorBanner } from "@/components/ui/errorBanner";
import { Input } from "@/components/ui/input";
import { listProjects } from "@/lib/api/projects";
import { cn } from "@/lib/utils/cn";
import { useAssetStore } from "@/stores/assetStore";
import type { AssetKind } from "@/types";

const FILTERS = ["all", "video", "audio", "image", "ai-generated"] as const;

type FilterId = (typeof FILTERS)[number];

const LAST_PROJECT_KEY = "lumora.lastProject";

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

export default function AssetsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const assets = useAssetStore((s) => s.assets);
  const loading = useAssetStore((s) => s.loading);
  const error = useAssetStore((s) => s.error);
  const loadAssets = useAssetStore((s) => s.loadAssets);
  const [projectLabel, setProjectLabel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const resolveProject = async () => {
      const stored = window.localStorage.getItem(LAST_PROJECT_KEY);
      if (stored) {
        if (active) setProjectLabel("Last opened project");
        await loadAssets(stored);
        return;
      }
      try {
        const projects = await listProjects();
        if (!active) return;
        if (projects.length === 0) {
          setProjectLabel(null);
          return;
        }
        const latest = [...projects].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        window.localStorage.setItem(LAST_PROJECT_KEY, latest.id);
        setProjectLabel(latest.name);
        await loadAssets(latest.id);
      } catch {
        if (!active) return;
        setProjectLabel(null);
        await loadAssets("");
      }
    };
    void resolveProject();
    return () => {
      active = false;
    };
  }, [loadAssets]);

  const query = searchQuery.trim().toLowerCase();

  const filtered = assets.filter((asset) => {
    if (query && !asset.name.toLowerCase().includes(query)) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "ai-generated") return asset.source === "ai-generated";
    return asset.kind === activeFilter;
  });

  const retry = useCallback(() => {
    const stored = window.localStorage.getItem(LAST_PROJECT_KEY);
    if (stored) void loadAssets(stored);
  }, [loadAssets]);

  return (
    <>
      <div className="px-8 pb-6 pt-8">
        <h1 className="text-2xl font-semibold text-white">Asset Library</h1>
        {projectLabel && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Showing assets for {projectLabel}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-72 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors duration-150",
                  activeFilter === filter
                    ? "bg-[#FF6A1A] text-white"
                    : "border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-white"
                )}
              >
                {filter === "all"
                  ? "All"
                  : filter === "ai-generated"
                    ? "AI-generated"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {error && (
          <div className="mb-6 max-w-xl">
            <ErrorBanner message={error} onRetry={retry} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No assets found"
            description={
              query
                ? "Try a different search or filter."
                : "Import media from a project, or generate assets from the editor."
            }
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filtered.map((asset) => {
              const Icon = THUMB_ICON[asset.kind];
              const meta =
                asset.kind === "image"
                  ? "IMG"
                  : formatDuration(asset.durationMs);
              return (
                <div
                  key={asset.id}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#26262A] transition-colors duration-150 hover:border-[var(--color-border-strong)]"
                >
                  <div
                    className="relative aspect-video"
                    style={{ backgroundColor: THUMB_BG[asset.kind] }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon
                        size={32}
                        style={{ color: THUMB_ICON_COLOR[asset.kind] }}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={`Menu for ${asset.name}`}
                      onClick={() => {
                        /* todo: asset actions menu (rename/delete via /api/assets) */
                      }}
                      className="absolute right-2 top-2 hidden cursor-pointer rounded bg-[var(--color-surface-3)] p-1 text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-primary)] group-hover:flex"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm text-white">{asset.name}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {meta}
                      </span>
                      {asset.source === "ai-generated" ? (
                        <span className="rounded-full border border-[#FF6A1A] px-2 py-0.5 text-xs text-[#FF6A1A]">
                          AI-generated
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                          Upload
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
