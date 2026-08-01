"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, MoreHorizontal, Music, Search } from "lucide-react";

import { EmptyState } from "@/components/ui/emptyState";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { MOCK_ASSETS } from "@/lib/mock/assets";
import type { AssetKind } from "@/types";

const FILTERS = ["all", "video", "audio", "image", "ai-generated"] as const;

type FilterId = (typeof FILTERS)[number];

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

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export default function AssetsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const filtered = MOCK_ASSETS.filter((asset) => {
    if (query && !asset.name.toLowerCase().includes(query)) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "ai-generated") return asset.source === "ai-generated";
    return asset.kind === activeFilter;
  });

  return (
    <>
      <div className="px-8 pb-6 pt-8">
        <h1 className="text-2xl font-semibold text-white">Asset Library</h1>
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
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No assets found"
            description="Try a different search or filter."
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filtered.map((asset) => {
              const Icon = THUMB_ICON[asset.kind];
              const meta =
                asset.kind === "image"
                  ? "IMG"
                  : formatDuration(asset.durationMs);
              const size = formatBytes(asset.sizeBytes);
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
                      onClick={() => console.log("Asset menu — mock")}
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
                        {size && ` · ${size}`}
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
