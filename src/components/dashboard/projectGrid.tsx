"use client";

import { NewProjectCard } from "@/components/dashboard/newProjectCard";
import { ProjectCard } from "@/components/dashboard/projectCard";
import { useProjects } from "@/hooks/useProjects";

export function ProjectGrid({ onNewProject }: { onNewProject: () => void }) {
  const projects = useProjects();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <NewProjectCard onClick={onNewProject} />
    </div>
  );
}
