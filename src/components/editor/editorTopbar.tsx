"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExportModal } from "@/components/editor/export/exportModal";
import { createRenderJob } from "@/lib/api/jobs";
import { toastError } from "@/lib/utils/toast";
import { useAiUiStore } from "@/stores/aiUiStore";
import { useEditorStore } from "@/stores/editorStore";

export function EditorTopbar() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const progressOpen = useAiUiStore((s) => s.progressOpen);
  const setProgressOpen = useAiUiStore((s) => s.setProgressOpen);
  const setRenderJobId = useAiUiStore((s) => s.setRenderJobId);
  const projectName = useEditorStore((s) => s.projectName);
  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = async () => {
    if (!projectId) {
      toastError("No project selected");
      return;
    }
    try {
      const job = await createRenderJob(projectId, "mp4");
      setRenderJobId(job.id);
      setProgressOpen(true);
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Failed to start render"
      );
    }
  };
  const displayName =
    projectName && projectName.length > 0
      ? projectName
      : projectId && !projectId.startsWith("mock-new-")
        ? projectId
        : "Untitled Project";

  return (
    <header className="flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] px-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-white">Lumora</span>
        <span className="h-5 w-px bg-[var(--color-border)]" />
        <input
          type="text"
          defaultValue={displayName}
          aria-label="Project name"
          className="w-48 rounded-sm bg-transparent px-2 py-0.5 text-sm text-white outline-none transition-colors hover:bg-[var(--color-surface-2)] focus:bg-[var(--color-surface-2)]"
        />
      </div>

      <div className="mx-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Undo"
          onClick={() => {
            /* todo: undo/redo is UI-only, no backend concept */
          }}
        >
          <Undo2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Redo"
          onClick={() => {
            /* todo: undo/redo is UI-only, no backend concept */
          }}
        >
          <Redo2 size={18} />
        </Button>
        <span className="mx-3 h-5 w-px bg-[var(--color-border)]" />
        <Button variant="outline" className="h-8 px-4 text-sm">
          Preview
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-xs text-[var(--color-text-muted)]">
          Job status placeholder
        </span>
        <div className="relative">
          <Button
            className="h-8 px-4 text-sm"
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          {progressOpen && (
            <span className="absolute -right-1.5 -top-1.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-primary)]" />
            </span>
          )}
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </header>
  );
}
