import { apiFetch } from "./client";

export type AssetDto = {
  id: string;
  source: string;
  mimeType: string;
  duration?: number | null;
  b2Key?: string | null;
  localPath?: string | null;
  sha256?: string | null;
  manifestRef?: string | null;
  tags: string[];
};

export type AssetListDto = {
  assets: AssetDto[];
};

export function listAssets(
  projectId: string,
  query?: string,
  tags?: string[]
) {
  const params = new URLSearchParams({ projectId });
  if (query) params.set("q", query);
  if (tags && tags.length > 0) params.set("tags", tags.join(","));
  return apiFetch<AssetListDto>(`/assets?${params.toString()}`);
}

export function importAsset(projectId: string, kind: string, file: File) {
  const form = new FormData();
  form.append("projectId", projectId);
  form.append("kind", kind);
  form.append("file", file);
  return apiFetch<AssetDto>("/assets/import", {
    method: "POST",
    body: form,
  });
}

export function getAssetUrl(assetId: string) {
  return apiFetch<{ url: string }>(`/assets/${assetId}/url`);
}

export function getAssetManifest(assetId: string) {
  return apiFetch<{ runId: string | null; data: Record<string, unknown> }>(
    `/assets/${assetId}/manifest`
  );
}

export function updateAssetTags(assetId: string, tags: string[]) {
  return apiFetch<AssetDto>(`/assets/${assetId}/tags`, {
    method: "PATCH",
    body: { tags },
  });
}

export function deleteAsset(assetId: string) {
  return apiFetch<void>(`/assets/${assetId}`, {
    method: "DELETE",
  });
}

export type WordTimingDto = {
  word: string;
  start: number;
  end: number;
};

export function transcribeAsset(assetId: string) {
  return apiFetch<{ assetId: string; words: WordTimingDto[] }>(`/transcribe`, {
    method: "POST",
    body: { assetId },
  });
}
