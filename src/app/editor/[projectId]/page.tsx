"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { EditorShell } from "@/components/editor/editorShell";
import { ErrorBanner } from "@/components/ui/errorBanner";
import { createTrack, getProjectTimeline } from "@/lib/api/timeline";
import { mapTimelineDetailToTimeline } from "@/lib/api/mappers";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";

const DEFAULT_TRACK_KINDS = ["video", "audio", "text", "effects"];

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const setProject = useEditorStore((s) => s.setProject);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const setTimeline = useTimelineStore((s) => s.setTimeline);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    const dto = await getProjectTimeline(projectId);
    setProject(projectId);
    setProjectName(dto.project.name);
    window.localStorage.setItem("lumora.lastProject", projectId);
    if (dto.tracks.length === 0) {
      await Promise.all(
        DEFAULT_TRACK_KINDS.map((kind) => createTrack(dto.timeline.id, kind))
      );
      const refreshed = await getProjectTimeline(projectId);
      setTimeline(mapTimelineDetailToTimeline(refreshed));
    } else {
      setTimeline(mapTimelineDetailToTimeline(dto));
    }
  }, [projectId, setProject, setProjectName, setTimeline]);

  const load = useCallback(() => {
    setState("loading");
    setError(null);
    fetchTimeline()
      .then(() => setState("ready"))
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load project timeline"
        );
        setState("error");
      });
  }, [fetchTimeline]);

  useEffect(() => {
    let active = true;
    fetchTimeline()
      .then(() => {
        if (active) setState("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load project timeline"
        );
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [fetchTimeline]);

  if (state === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[var(--color-neutral)] text-[var(--color-text-muted)]">
        <Loader2 className="size-6 animate-spin text-[#FF6A1A]" />
        <p className="text-sm">Loading timeline…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--color-neutral)] p-6">
        <AlertTriangle className="size-6 text-[#FF6A1A]" />
        <div className="w-full max-w-md">
          <ErrorBanner message={error ?? "Failed to load project"} onRetry={() => void load()} />
        </div>
      </div>
    );
  }

  return <EditorShell />;
}
