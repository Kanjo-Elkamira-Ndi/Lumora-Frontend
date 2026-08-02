import { create } from "zustand";

type EditorState = {
  projectId: string | null;
  projectName: string | null;
  selectedLayerId: string | null;
  playheadPosition: number;
  isPlaying: boolean;
  draggingLayerId: string | null;
  setProject: (projectId: string) => void;
  setProjectName: (projectName: string) => void;
  selectLayer: (layerId: string | null) => void;
  setPlayheadPosition: (position: number | ((prev: number) => number)) => void;
  setPlaying: (playing: boolean) => void;
  setDraggingLayer: (layerId: string | null) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  projectId: null,
  projectName: null,
  selectedLayerId: null,
  playheadPosition: 0,
  isPlaying: false,
  draggingLayerId: null,
  setProject: (projectId) => set({ projectId }),
  setProjectName: (projectName) => set({ projectName }),
  selectLayer: (selectedLayerId) => set({ selectedLayerId }),
  setPlayheadPosition: (position) =>
    set((state) => ({
      playheadPosition:
        typeof position === "function"
          ? position(state.playheadPosition)
          : position,
    })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setDraggingLayer: (draggingLayerId) => set({ draggingLayerId }),
}));
