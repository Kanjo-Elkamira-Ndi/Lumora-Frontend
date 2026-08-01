"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, Music, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useAssetStore } from "@/stores/assetStore";
import type { AssetKind } from "@/types";

const TABS = [
  { id: "media", label: "Media" },
  { id: "text", label: "Text" },
  { id: "audio", label: "Audio" },
  { id: "ai", label: "AI Assist" },
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
  const searchQuery = useAssetStore((s) => s.searchQuery);
  const selectAsset = useAssetStore((s) => s.selectAsset);
  const setSearchQuery = useAssetStore((s) => s.setSearchQuery);

  const filtered = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

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
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filtered.map((asset) => {
              const Icon = THUMB_ICON[asset.kind];
              return (
                <div
                  key={asset.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    selectAsset(asset.id);
                    console.log("Add to timeline — mock", asset.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectAsset(asset.id);
                      console.log("Add to timeline — mock", asset.id);
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

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10">
              <p className="text-sm text-[var(--color-text-muted)]">
                No assets match “{searchQuery}”
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "text" && <EmptyTab label="Text overlays coming soon" />}
      {activeTab === "audio" && <EmptyTab label="Audio browser coming soon" />}
      {activeTab === "ai" && <EmptyTab label="AI Assist coming soon" />}
    </aside>
  );
}

