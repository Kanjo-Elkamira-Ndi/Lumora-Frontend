"use client";

import { useCallback, useEffect, useState } from "react";

import { listProjects, type ProjectDto } from "@/lib/api/projects";
import type { Project } from "@/types";

function mapProject(dto: ProjectDto): Project {
  return {
    id: dto.id,
    name: dto.name,
    updatedAt: dto.updatedAt,
    thumbnailUrl: undefined,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await listProjects();
        if (!active) return;
        setProjects(list.map(mapProject));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load projects.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return listProjects()
      .then((list) => {
        setProjects(list.map(mapProject));
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load projects.")
      )
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error, refresh };
}
