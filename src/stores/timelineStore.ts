import { create } from "zustand";

import { MOCK_TIMELINE } from "@/lib/mock/timeline";
import type { Layer, Timeline } from "@/types";

type TimelineState = {
  timeline: Timeline | null;
  setTimeline: (timeline: Timeline) => void;
  addLayer: (trackId: string, layer: Layer) => void;
  updateLayerOptimistic: (
    trackId: string,
    layerId: string,
    patch: Partial<Layer>
  ) => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: MOCK_TIMELINE,
  setTimeline: (timeline) => set({ timeline }),
  addLayer: (trackId, layer) =>
    set((state) => {
      if (!state.timeline) return state;
      return {
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map((track) =>
            track.id === trackId
              ? { ...track, layers: [...track.layers, layer] }
              : track
          ),
        },
      };
    }),
  updateLayerOptimistic: (trackId, layerId, patch) =>
    set((state) => {
      if (!state.timeline) return state;
      return {
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map((track) =>
            track.id === trackId
              ? {
                  ...track,
                  layers: track.layers.map((layer) =>
                    layer.id === layerId ? { ...layer, ...patch } : layer
                  ),
                }
              : track
          ),
        },
      };
    }),
}));
