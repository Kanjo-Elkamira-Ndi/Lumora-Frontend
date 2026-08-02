"use client";

import { FolderOpen } from "lucide-react";

import { NewProjectCard } from "@/components/dashboard/newProjectCard";
import { ProjectCard } from "@/components/dashboard/projectCard";
import { EmptyState } from "@/components/ui/emptyState";
import { ErrorBanner } from "@/components/ui/errorBanner";
import { useProjects } from "@/hooks/useProjects";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="aspect-video animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]"
        />
      ))}
    </div>
  );
}

export function ProjectGrid({ onNewProject }: { onNewProject: () => void }) {
  const { projects, loading, error, refresh } = useProjects();

  if (loading && projects.length === 0) {
    return <SkeletonGrid />;
  }

  if (error && projects.length === 0) {
    return <ErrorBanner message={error} onRetry={() => void refresh()} />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Create your first project to start editing."
        actionLabel="New Project"
        onAction={onNewProject}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} onRetry={() => void refresh()} />}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <NewProjectCard onClick={onNewProject} />
      </div>
    </div>
  );
}
