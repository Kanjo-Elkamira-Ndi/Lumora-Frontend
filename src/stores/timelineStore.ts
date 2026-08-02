import { create } from "zustand";

import {
  createLayer,
  deleteLayer,
  updateLayerParams,
} from "@/lib/api/timeline";
import {
  layerToBackend,
  mapLayer,
} from "@/lib/api/mappers";
import type { Layer, Timeline } from "@/types";
import type { Asset } from "@/types/asset";
import type { LayerDto } from "@/lib/api/timeline";

type TimelineState = {
  timeline: Timeline | null;
  setTimeline: (timeline: Timeline) => void;
  addLayer: (trackId: string, layer: Layer) => void;
  addAssetLayer: (
    asset: Pick<Asset, "id" | "name" | "kind" | "durationMs">,
    startMs: number
  ) => void;
  updateLayerOptimistic: (
    trackId: string,
    layerId: string,
    patch: Partial<Layer>
  ) => void;
  removeLayer: (trackId: string, layerId: string) => void;
};

function updateTrack(
  timeline: Timeline,
  trackId: string,
  update: (layers: Layer[]) => Layer[]
): Timeline {
  return {
    ...timeline,
    tracks: timeline.tracks.map((track) =>
      track.id === trackId ? { ...track, layers: update(track.layers) } : track
    ),
  };
}

function mergeServerLayer(local: Layer, created: LayerDto): Layer {
  const mapped = mapLayer(created);
  return {
    ...mapped,
    startMs: mapped.startMs > 0 ? mapped.startMs : local.startMs,
    durationMs: mapped.durationMs > 0 ? mapped.durationMs : local.durationMs,
    label: mapped.label || local.label,
  };
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: null,
  setTimeline: (timeline) => set({ timeline }),
  addLayer: (trackId, layer) => {
    const timeline = get().timeline;
    if (!timeline) return;
    const tempLayer = { ...layer, id: layer.id || `tmp_${Date.now()}` };
    set({
      timeline: updateTrack(timeline, trackId, (layers) => [
        ...layers,
        tempLayer,
      ]),
    });
    createLayer(trackId, layerToBackend(tempLayer))
      .then((created) => {
        const current = get().timeline;
        if (!current) return;
        set({
          timeline: updateTrack(current, trackId, (layers) =>
            layers.map((l) =>
              l.id === tempLayer.id
                ? mergeServerLayer(tempLayer, created)
                : l
            )
          ),
        });
      })
      .catch((error) => {
        console.error("Failed to create layer", error);
        const current = get().timeline;
        if (!current) return;
        set({
          timeline: updateTrack(current, trackId, (layers) =>
            layers.filter((l) => l.id !== tempLayer.id)
          ),
        });
      });
  },
  addAssetLayer: (asset, startMs) => {
    const timeline = get().timeline;
    if (!timeline) return;
    const trackType = asset.kind === "audio" ? "audio" : "video";
    const track = timeline.tracks.find((t) => t.type === trackType);
    if (!track) return;
    const start = Math.max(0, Math.round(startMs));
    get().addLayer(track.id, {
      id: `tmp_${Date.now()}`,
      type: track.type,
      label: asset.name,
      source: "manual",
      startMs: start,
      durationMs: asset.durationMs ?? 10000,
      assetId: asset.id,
      props: { assetId: asset.id, start: start / 1000, name: asset.name },
    });
  },
  updateLayerOptimistic: (trackId, layerId, patch) => {
    const timeline = get().timeline;
    if (!timeline) return;
    const track = timeline.tracks.find((t) => t.id === trackId);
    const previous = track?.layers.find((l) => l.id === layerId);
    if (!track || !previous) return;
    set({
      timeline: updateTrack(timeline, trackId, (layers) =>
        layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l))
      ),
    });
    const merged: Layer = { ...previous, ...patch };
    updateLayerParams(trackId, layerId, layerToBackendParams(merged))
      .then((updated) => {
        const current = get().timeline;
        if (!current) return;
        set({
          timeline: updateTrack(current, trackId, (layers) =>
            layers.map((l) =>
              l.id === layerId ? mergeServerLayer(merged, updated) : l
            )
          ),
        });
      })
      .catch((error) => {
        console.error("Failed to update layer", error);
        const current = get().timeline;
        if (!current) return;
        set({
          timeline: updateTrack(current, trackId, (layers) =>
            layers.map((l) => (l.id === layerId ? previous : l))
          ),
        });
      });
  },
  removeLayer: (trackId, layerId) => {
    const timeline = get().timeline;
    if (!timeline) return;
    const track = timeline.tracks.find((t) => t.id === trackId);
    const previous = track?.layers.find((l) => l.id === layerId);
    if (!track || !previous) return;
    set({
      timeline: updateTrack(timeline, trackId, (layers) =>
        layers.filter((l) => l.id !== layerId)
      ),
    });
    deleteLayer(trackId, layerId).catch((error) => {
      console.error("Failed to delete layer", error);
      const current = get().timeline;
      if (!current) return;
      set({
        timeline: updateTrack(current, trackId, (layers) => {
          if (layers.some((l) => l.id === layerId)) return layers;
          const next = [...layers, previous];
          next.sort((a, b) => a.startMs - b.startMs);
          return next;
        }),
      });
    });
  },
}));

function layerToBackendParams(layer: Layer): Record<string, unknown> {
  return layerToBackend(layer).params;
}
