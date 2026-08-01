import { create } from "zustand";

type EditorState = {
  projectId: string | null;
  selectedLayerId: string | null;
  playheadPosition: number;
  draggingLayerId: string | null;
  setProject: (projectId: string) => void;
  selectLayer: (layerId: string | null) => void;
  setPlayheadPosition: (position: number | ((prev: number) => number)) => void;
  setDraggingLayer: (layerId: string | null) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  projectId: null,
  selectedLayerId: null,
  playheadPosition: 0,
  draggingLayerId: null,
  setProject: (projectId) => set({ projectId }),
  selectLayer: (selectedLayerId) => set({ selectedLayerId }),
  setPlayheadPosition: (position) =>
    set((state) => ({
      playheadPosition:
        typeof position === "function"
          ? position(state.playheadPosition)
          : position,
    })),
  setDraggingLayer: (draggingLayerId) => set({ draggingLayerId }),
}));
