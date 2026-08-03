import { create } from "zustand";
import { persist } from "zustand/middleware";

export const LEFT_WIDTH_MIN = 200;
export const LEFT_WIDTH_MAX = 480;
export const RIGHT_WIDTH_MIN = 240;
export const RIGHT_WIDTH_MAX = 480;
export const TIMELINE_HEIGHT_MIN = 120;
export const TIMELINE_HEIGHT_MAX = 520;

export const DEFAULT_LEFT_WIDTH = 280;
export const DEFAULT_RIGHT_WIDTH = 300;
export const DEFAULT_TIMELINE_HEIGHT = 220;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

type LayoutState = {
  leftWidth: number;
  rightWidth: number;
  timelineHeight: number;
  resizeLeft: (delta: number) => void;
  resizeRight: (delta: number) => void;
  resizeTimeline: (delta: number) => void;
  resetLayout: () => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      leftWidth: DEFAULT_LEFT_WIDTH,
      rightWidth: DEFAULT_RIGHT_WIDTH,
      timelineHeight: DEFAULT_TIMELINE_HEIGHT,
      resizeLeft: (delta) =>
        set({
          leftWidth: clamp(
            get().leftWidth + delta,
            LEFT_WIDTH_MIN,
            LEFT_WIDTH_MAX
          ),
        }),
      resizeRight: (delta) =>
        set({
          rightWidth: clamp(
            get().rightWidth + delta,
            RIGHT_WIDTH_MIN,
            RIGHT_WIDTH_MAX
          ),
        }),
      resizeTimeline: (delta) =>
        set({
          timelineHeight: clamp(
            get().timelineHeight + delta,
            TIMELINE_HEIGHT_MIN,
            TIMELINE_HEIGHT_MAX
          ),
        }),
      resetLayout: () =>
        set({
          leftWidth: DEFAULT_LEFT_WIDTH,
          rightWidth: DEFAULT_RIGHT_WIDTH,
          timelineHeight: DEFAULT_TIMELINE_HEIGHT,
        }),
    }),
    {
      name: "lumora-editor-layout",
      partialize: (state) => ({
        leftWidth: state.leftWidth,
        rightWidth: state.rightWidth,
        timelineHeight: state.timelineHeight,
      }),
    }
  )
);
