import { create } from "zustand";

import type { Tier1Kind } from "@/lib/api/jobs";

type ActiveJob = {
  jobId: string;
  kind: Tier1Kind;
};

type AiUiState = {
  progressOpen: boolean;
  setProgressOpen: (open: boolean) => void;
  activeJob: ActiveJob | null;
  setActiveJob: (job: ActiveJob | null) => void;
  renderJobId: string | null;
  setRenderJobId: (id: string | null) => void;
};

export const useAiUiStore = create<AiUiState>((set) => ({
  progressOpen: false,
  setProgressOpen: (progressOpen) => set({ progressOpen }),
  activeJob: null,
  setActiveJob: (activeJob) => set({ activeJob }),
  renderJobId: null,
  setRenderJobId: (renderJobId) => set({ renderJobId }),
}));
