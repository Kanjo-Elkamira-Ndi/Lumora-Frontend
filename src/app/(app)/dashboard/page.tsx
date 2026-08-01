"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { NewProjectModal } from "@/components/dashboard/newProjectModal";
import { ProjectGrid } from "@/components/dashboard/projectGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="px-8 pb-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-40 bg-[var(--color-surface-1)] pl-9 sm:w-64"
              />
            </div>
            <Button onClick={() => setModalOpen(true)}>New Project</Button>
          </div>
        </div>
      </div>
      <div className="px-8 pb-8">
        <ProjectGrid onNewProject={() => setModalOpen(true)} />
      </div>
      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
