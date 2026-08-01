"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CloudUpload, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Cinematic/Desktop)" },
  { value: "9:16", label: "9:16 (Social/Vertical)" },
  { value: "1:1", label: "1:1 (Square)" },
];

const STARTING_POINTS = [
  {
    id: "blank",
    label: "Start blank",
    description: "Empty timeline with no initial assets",
    icon: PlusCircle,
  },
  {
    id: "import",
    label: "Import media",
    description: "Open your file explorer to add clips",
    icon: CloudUpload,
  },
];

export function NewProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [startingPoint, setStartingPoint] = useState("blank");

  const createProject = () => {
    onOpenChange(false);
    router.push(`/editor/mock-new-${Date.now()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="px-6 pb-4 pt-6">
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription className="mt-1">
            Set up your workspace to start editing.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-6 px-6 py-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled Project"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Aspect Ratio
            </label>
            <Select value={ratio} onValueChange={setRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratioItem) => (
                  <SelectItem key={ratioItem.value} value={ratioItem.value}>
                    {ratioItem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Starting Point
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STARTING_POINTS.map((point) => {
                const Icon = point.icon;
                const selected = startingPoint === point.id;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => setStartingPoint(point.id)}
                    className={cn(
                      "group flex cursor-pointer flex-col items-center gap-3 rounded-lg border p-6 transition-all duration-200",
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-surface-2)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-0)] hover:bg-[var(--color-surface-2)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-3)] transition-transform duration-200 group-hover:scale-110",
                        selected && "scale-110"
                      )}
                    >
                      <Icon className="size-7 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-sm font-bold text-white">{point.label}</span>
                    <span className="text-center text-[10px] text-[var(--color-text-muted)]">
                      {point.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-0)] px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={createProject} className="px-8">
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
