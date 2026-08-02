import type { ProjectDto } from "./projects";
import { apiFetch } from "./client";

export type LayerDto = {
  id: string;
  trackId: string;
  layerType: string;
  params: Record<string, unknown>;
  source: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TrackDto = {
  id: string;
  timelineId: string;
  kind: string;
  position: number;
  createdAt: string;
  layers: LayerDto[];
};

export type TimelineDetailDto = {
  project: ProjectDto;
  timeline: {
    id: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
  };
  tracks: TrackDto[];
};

export type CreateLayerRequest = {
  layerType: string;
  params: Record<string, unknown>;
  source: string;
};

export function getProjectTimeline(projectId: string) {
  return apiFetch<TimelineDetailDto>(`/projects/${projectId}/timeline`);
}

export function createTrack(timelineId: string, kind: string) {
  return apiFetch<{
    id: string;
    timelineId: string;
    kind: string;
    position: number;
  }>(`/timelines/${timelineId}/tracks`, {
    method: "POST",
    body: { kind },
  });
}

export function createLayer(trackId: string, data: CreateLayerRequest) {
  return apiFetch<LayerDto>(`/tracks/${trackId}/layers`, {
    method: "POST",
    body: data,
  });
}

export function updateLayerParams(
  trackId: string,
  layerId: string,
  params: Record<string, unknown>
) {
  return apiFetch<LayerDto>(`/tracks/${trackId}/layers/${layerId}`, {
    method: "PATCH",
    body: { params },
  });
}

export function deleteLayer(trackId: string, layerId: string) {
  return apiFetch<void>(`/tracks/${trackId}/layers/${layerId}`, {
    method: "DELETE",
  });
}
