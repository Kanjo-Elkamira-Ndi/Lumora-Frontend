"use client";

import { Plus } from "lucide-react";

export function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full cursor-pointer rounded-xl border border-dashed border-[var(--color-border-strong)] transition-colors duration-200 hover:border-[var(--color-primary)]"
    >
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Plus className="size-8 text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-white" />
        <span className="text-sm text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-white">
          New project
        </span>
      </span>
      <span aria-hidden="true" className="block pt-[calc(56.25%+72px)]" />
    </button>
  );
}
