import type { Asset, AssetKind, Layer, LayerSource, LayerType, Timeline, Track } from "@/types";
import type { AssetDto } from "./assets";
import type { Job, JobStatus, JobTier } from "@/types/job";
import type { JobDto } from "./jobs";
import type { LayerDto, TrackDto, TimelineDetailDto } from "./timeline";

export const BACKEND_SOURCE_TO_FRONTEND: Record<string, LayerSource> = {
  manual: "manual",
  ai: "genblaze_generated",
  llm_suggested: "llm_suggested",
};

export const FRONTEND_SOURCE_TO_BACKEND: Record<LayerSource, string> = {
  manual: "manual",
  genblaze_generated: "ai",
  llm_suggested: "llm_suggested",
};

const TRACK_KIND_TO_TYPE: Record<string, LayerType> = {
  video: "video",
  audio: "audio",
  text: "text",
  effects: "effect",
};

const LAYER_TYPE_MAP: Record<string, LayerType> = {
  clip: "video",
  transition: "effect",
  audio: "audio",
  text: "text",
  effect: "effect",
};

const TYPE_TO_BACKEND_LAYER_TYPE: Record<LayerType, string> = {
  video: "clip",
  audio: "audio",
  text: "text",
  effect: "effect",
};

const TRACK_NAMES: Record<LayerType, string> = {
  video: "Video",
  audio: "Audio",
  text: "Text",
  effect: "Effects",
};

function toMs(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}

function deriveLabel(layerType: string, params: Record<string, unknown>): string {
  if (layerType === "text") {
    return typeof params.content === "string" && params.content
      ? params.content
      : "Text";
  }
  if (layerType === "transition" || layerType === "effect") {
    const name = typeof params.filterType === "string" && params.filterType
      ? params.filterType
      : typeof params.type === "string" && params.type
        ? params.type
        : "Effect";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  if (layerType === "clip" || layerType === "audio") {
    const name = params.name ?? params.filename ?? params.assetName;
    return typeof name === "string" && name
      ? name
      : layerType === "clip"
        ? "Media clip"
        : "Audio clip";
  }
  return "Audio clip";
}

export function mapLayer(layer: LayerDto): Layer {
  const type = LAYER_TYPE_MAP[layer.layerType] ?? "effect";
  const props = layer.params;
  const start = props.startTime ?? props.start;
  const end = props.end;
  const explicitDuration = props.duration;
  const duration =
    typeof explicitDuration === "number"
      ? explicitDuration
      : typeof end === "number" && typeof start === "number"
        ? end - start
        : undefined;

  return {
    id: layer.id,
    type,
    label: deriveLabel(layer.layerType, props),
    source: BACKEND_SOURCE_TO_FRONTEND[layer.source] ?? "manual",
    startMs: toMs(start),
    durationMs: duration === undefined ? 0 : toMs(duration),
    assetId: typeof props.assetId === "string" ? props.assetId : undefined,
    props,
  };
}

export function mapTrack(track: TrackDto): Track {
  const type = TRACK_KIND_TO_TYPE[track.kind] ?? "video";
  return {
    id: track.id,
    type,
    name: TRACK_NAMES[type],
    layers: track.layers.map(mapLayer),
  };
}

export function mapTimelineDetailToTimeline(dto: TimelineDetailDto): Timeline {
  const tracks = dto.tracks.map(mapTrack);
  const durationMs = Math.max(
    30000,
    ...tracks.flatMap((track) =>
      track.layers.map((layer) => layer.startMs + layer.durationMs)
    )
  );
  return {
    id: dto.timeline.id,
    projectId: dto.timeline.projectId,
    durationMs,
    tracks,
  };
}

export function layerToBackendParams(layer: Layer): Record<string, unknown> {
  const params: Record<string, unknown> = { ...(layer.props ?? {}) };
  params.startTime = layer.startMs / 1000;
  params.duration = layer.durationMs / 1000;
  return params;
}

export function layerToBackend(
  layer: Layer
): { layerType: string; params: Record<string, unknown>; source: string } {
  return {
    layerType: TYPE_TO_BACKEND_LAYER_TYPE[layer.type],
    params: layerToBackendParams(layer),
    source: FRONTEND_SOURCE_TO_BACKEND[layer.source],
  };
}

function kindFromMime(mimeType: string): AssetKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "video";
}

function prettifyName(basename: string): string {
  const stem = basename.replace(/\.[^.]+$/, "");
  return stem.replace(/[-_]+/g, " ");
}

export function mapAsset(dto: AssetDto): Asset {
  const kind = kindFromMime(dto.mimeType);
  const b2Name = dto.b2Key ? dto.b2Key.split("/").pop() : undefined;
  const localName = dto.localPath ? dto.localPath.split("/").pop() : undefined;
  const name = prettifyName(b2Name ?? localName ?? dto.mimeType.split("/").pop() ?? "asset");
  return {
    id: dto.id,
    name: name || "Untitled asset",
    kind,
    url: "",
    durationMs: dto.duration ? Math.round(dto.duration * 1000) : undefined,
    mimeType: dto.mimeType,
    source: dto.source === "ai" ? "ai-generated" : "upload",
    tags: dto.tags ?? [],
  };
}

const BACKEND_JOB_STATUS: Record<string, JobStatus> = {
  pending: "running",
  running: "running",
  completed: "complete",
  failed: "error",
};

export function mapJobStatus(status: string): JobStatus {
  return BACKEND_JOB_STATUS[status] ?? "running";
}

const BACKEND_TIER: Record<number, JobTier> = {
  0: "tier0",
  1: "tier1",
  2: "agentic",
};

export function mapJob(dto: JobDto): Job {
  const base = {
    id: dto.id,
    projectId: dto.projectId,
    prompt: dto.prompt,
    tier: BACKEND_TIER[dto.tier] ?? "tier1",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
  const status = mapJobStatus(dto.status);
  if (status === "complete") {
    const asset = dto.result?.asset as { id?: string } | undefined;
    return {
      ...base,
      status: "complete",
      percent: 100,
      layerId: asset?.id ?? "",
    };
  }
  if (status === "error") {
    return { ...base, status: "error", message: dto.error ?? "Generation failed" };
  }
  return {
    ...base,
    status: "running",
    percent: 0,
    message: dto.status === "pending" ? "Queued…" : "Generating…",
  };
}
