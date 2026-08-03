"use client";

import { Film, MousePointer2, Music, Sparkles, Type, type LucideIcon } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { TextStyleControls } from "@/components/editor/properties/textStyleControls";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Layer, Track } from "@/types";

const TRACK_ICONS: Record<Track["type"], LucideIcon> = {
  video: Film,
  audio: Music,
  text: Type,
  effect: Sparkles,
};

function SourceBadge({ source }: { source: Layer["source"] }) {
  if (source === "manual") return null;
  return (
    <span
      className={cn(
        "shrink-0 rounded-sm px-1 py-0.5 text-[8px] font-bold tracking-widest",
        source === "genblaze_generated"
          ? "bg-[rgba(255,106,26,0.15)] text-[#FF6A1A]"
          : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
      )}
    >
      {source === "genblaze_generated" ? "GEN" : "AI"}
    </span>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
      {children}
    </label>
  );
}

function NumberField({
  label,
  defaultValue,
  onUpdate,
}: {
  label: string;
  defaultValue: number;
  onUpdate: (field: string, value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        aria-label={label}
        defaultValue={defaultValue}
        onChange={(e) => onUpdate(label.toLowerCase().replace(/\s+/g, ""), e.target.value)}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1.5 text-xs text-white focus:border-[var(--color-primary)] focus:outline-none"
      />
    </div>
  );
}

export function LayerPropertiesPanel() {
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const timeline = useTimelineStore((s) => s.timeline);

  let selected: { layer: Layer; track: Track } | null = null;
  if (timeline) {
    outer: for (const track of timeline.tracks) {
      for (const layer of track.layers) {
        if (layer.id === selectedLayerId) {
          selected = { layer, track };
          break outer;
        }
      }
    }
  }

  const updateField = (field: string, value: unknown) => {
    if (!selected) return;
    const layer = selected.layer;
    const num = typeof value === "number" ? value : Number(value);
    const patch: Partial<Layer> = {};
    switch (field) {
      case "start":
        patch.startMs = Math.round(num * 1000);
        break;
      case "duration":
        patch.durationMs = Math.round(num * 1000);
        break;
      case "fontSize":
        patch.props = { ...layer.props, size: num };
        break;
      default:
        patch.props = { ...layer.props, [field]: value };
        break;
    }
    useTimelineStore
      .getState()
      .updateLayerOptimistic(selected.track.id, layer.id, patch);
  };

  const onUpdate = (field: string, value: unknown) =>
    updateField(field, value);

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-[var(--color-surface-1)]">
      <header className="shrink-0 border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-sm font-medium text-white">Properties</h2>
      </header>

      {!selected ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <MousePointer2 size={32} className="text-[var(--color-text-muted)]" />
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Select a layer</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = TRACK_ICONS[selected.track.type];
                return <Icon size={14} className="shrink-0 text-[var(--color-text-muted)]" />;
              })()}
              <span className="truncate text-sm font-medium text-white">
                {selected.layer.label}
              </span>
              <SourceBadge source={selected.layer.source} />
            </div>
          </div>

          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <SectionLabel>Position &amp; Timing</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Start"
                defaultValue={selected.layer.startMs / 1000}
                onUpdate={(field, value) => onUpdate(field, value)}
              />
              <NumberField
                label="Duration"
                defaultValue={selected.layer.durationMs / 1000}
                onUpdate={(field, value) => onUpdate(field, value)}
              />
            </div>
          </div>

          <div className="px-4 py-3">
            <SectionLabel>Properties</SectionLabel>

            {selected.layer.type === "video" && (
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel>Opacity</FieldLabel>
                  <Slider
                    aria-label="Opacity"
                    defaultValue={[Number(selected.layer.props?.opacity ?? 100)]}
                    min={0}
                    max={100}
                    onValueChange={(v) => onUpdate("opacity", v[0])}
                  />
                </div>
                <div>
                  <FieldLabel>Playback Rate</FieldLabel>
                  <Select
                    aria-label="Playback Rate"
                    defaultValue={String(selected.layer.props?.playbackRate ?? "1x")}
                    onValueChange={(v) => onUpdate("playbackRate", v)}
                  >
                    <SelectTrigger className="h-8 px-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["0.5x", "1x", "1.5x", "2x"].map((rate) => (
                        <SelectItem key={rate} value={rate}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selected.layer.type === "audio" && (
              <div>
                <FieldLabel>Volume</FieldLabel>
                <Slider
                  aria-label="Volume"
                  defaultValue={[Number(selected.layer.props?.volume ?? 80)]}
                  min={0}
                  max={100}
                  onValueChange={(v) => onUpdate("volume", v[0])}
                />
              </div>
            )}

            {selected.layer.type === "text" && (
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel>Content</FieldLabel>
                  <Textarea
                    rows={3}
                    value={String(selected.layer.props?.content ?? "")}
                    onChange={(e) => onUpdate("content", e.target.value)}
                  />
                </div>
                <TextStyleControls
                  props={selected.layer.props ?? {}}
                  onChange={(field, value) => onUpdate(field, value)}
                />
              </div>
            )}

            {selected.layer.type === "effect" && (
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel>Effect</FieldLabel>
                  <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1.5 text-xs text-white">
                    {String(selected.layer.props?.filterType ?? "blur")}
                  </div>
                </div>
                <div>
                  <FieldLabel>Intensity</FieldLabel>
                  <Slider
                    aria-label="Intensity"
                    defaultValue={[Number(selected.layer.props?.intensity ?? 50)]}
                    min={0}
                    max={100}
                    onValueChange={(v) => onUpdate("intensity", v[0])}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
