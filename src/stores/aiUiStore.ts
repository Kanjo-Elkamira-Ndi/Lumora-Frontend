import { create } from "zustand";

type AiUiState = {
  progressOpen: boolean;
  setProgressOpen: (open: boolean) => void;
};

export const useAiUiStore = create<AiUiState>((set) => ({
  progressOpen: false,
  setProgressOpen: (progressOpen) => set({ progressOpen }),
}));
