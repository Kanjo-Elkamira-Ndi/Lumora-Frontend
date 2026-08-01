"use client";

import { useParams } from "next/navigation";
import { Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EditorTopbar() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const displayName =
    projectId && !projectId.startsWith("mock-new-")
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
          onClick={() => console.log("Undo — mock")}
        >
          <Undo2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="size-8 p-0"
          aria-label="Redo"
          onClick={() => console.log("Redo — mock")}
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
        <Button
          className="h-8 px-4 text-sm"
          onClick={() => console.log("Export — mock")}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
