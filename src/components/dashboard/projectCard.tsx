"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Film, MoreHorizontal } from "lucide-react";

import type { Project } from "@/types";

function formatLastEdited(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export function ProjectCard({ project }: { project: Project }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = project.thumbnailUrl && !imgFailed;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setImgFailed(true);
    }
  }, []);

  return (
    <Link
      href={`/editor/${project.id}`}
      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] transition-colors duration-200 hover:border-[var(--color-primary)]"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-[var(--color-surface-3)]">
        {showImage ? (
          <img
            ref={imgRef}
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="size-8 text-[var(--color-text-muted)]" />
          </div>
        )}
        <button
          type="button"
          aria-label={`More options for ${project.name}`}
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 rounded-md p-1 text-[var(--color-text-muted)] opacity-0 transition-opacity duration-200 hover:text-white group-hover:opacity-100"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-white">{project.name}</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Last edited {formatLastEdited(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
