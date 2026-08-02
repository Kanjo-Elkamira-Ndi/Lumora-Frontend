import { apiFetch } from "./client";

export type ProjectDto = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectResponse = {
  project: ProjectDto;
  timeline: {
    id: string;
    projectId: string;
  };
};

export function listProjects() {
  return apiFetch<ProjectDto[]>("/projects");
}

export function createProject(name: string) {
  return apiFetch<CreateProjectResponse>("/projects", {
    method: "POST",
    body: { name },
  });
}

export function renameProject(id: string, name: string) {
  return apiFetch<ProjectDto>(`/projects/${id}`, {
    method: "PATCH",
    body: { name },
  });
}

export function deleteProject(id: string) {
  return apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}
