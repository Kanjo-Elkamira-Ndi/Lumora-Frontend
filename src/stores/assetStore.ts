import { create } from "zustand";

import { MOCK_ASSETS } from "@/lib/mock/assets";
import type { Asset } from "@/types";

type AssetState = {
  assets: Asset[];
  selectedAssetId: string | null;
  searchQuery: string;
  setAssets: (assets: Asset[]) => void;
  selectAsset: (assetId: string | null) => void;
  setSearchQuery: (query: string) => void;
};

export const useAssetStore = create<AssetState>((set) => ({
  assets: MOCK_ASSETS,
  selectedAssetId: null,
  searchQuery: "",
  setAssets: (assets) => set({ assets }),
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
