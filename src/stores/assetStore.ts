import { create } from "zustand";

import { deleteAsset, listAssets, updateAssetTags } from "@/lib/api/assets";
import { mapAsset } from "@/lib/api/mappers";
import type { Asset } from "@/types";

type AssetState = {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  selectedAssetId: string | null;
  searchQuery: string;
  setAssets: (assets: Asset[]) => void;
  selectAsset: (assetId: string | null) => void;
  setSearchQuery: (query: string) => void;
  addImportedAsset: (asset: Asset) => void;
  loadAssets: (projectId: string) => Promise<void>;
  setAssetTags: (assetId: string, tags: string[]) => Promise<void>;
  removeAsset: (assetId: string) => Promise<void>;
};

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  loading: false,
  error: null,
  selectedAssetId: null,
  searchQuery: "",
  setAssets: (assets) => set({ assets }),
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addImportedAsset: (asset) =>
    set((state) => ({ assets: [asset, ...state.assets] })),
  loadAssets: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await listAssets(projectId);
      set({ assets: data.assets.map(mapAsset), loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load assets",
        loading: false,
      });
    }
  },
  setAssetTags: async (assetId, tags) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === assetId ? { ...a, tags } : a
      ),
    }));
    await updateAssetTags(assetId, tags);
  },
  removeAsset: async (assetId) => {
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId),
      selectedAssetId:
        state.selectedAssetId === assetId ? null : state.selectedAssetId,
    }));
    await deleteAsset(assetId);
  },
}));
