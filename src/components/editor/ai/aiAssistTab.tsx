"use client";

import { useState } from "react";
import {
  Captions,
  Scissors,
  Shuffle,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Tier1Modal } from "./tier1Modal";

const SUGGESTIONS: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onSuggest: () => void;
}[] = [
  {
    id: "captions",
    icon: Captions,
    title: "Auto-generate captions",
    description: "Transcribe your video and add word-level caption layers.",
    onSuggest: () => {
      /* todo: POST /api/jobs {tier:0, jobType:"caption"} then apply result */
    },
  },
  {
    id: "transitions",
    icon: Shuffle,
    title: "Suggest transitions",
    description: "AI picks the right cut for the mood of each scene.",
    onSuggest: () => {
      /* todo: POST /api/jobs {tier:0, jobType:"transition"} then apply result */
    },
  },
  {
    id: "cut",
    icon: Scissors,
    title: "Smart cut points",
    description: "Find the best 30-second highlight from your footage.",
    onSuggest: () => {
      /* todo: POST /api/jobs {tier:0, jobType:"cut_points"} then apply result */
    },
  },
  {
    id: "title",
    icon: Type,
    title: "Generate title card",
    description: "AI writes and styles an opening title layer.",
    onSuggest: () => {
      /* todo: POST /api/jobs {tier:0, jobType:"motion_spec"} then apply result */
    },
  },
];

const CAPTION_SUGGESTIONS = [
  "Welcome to our product demo.",
  "Today we'll cover three key features.",
  "Let's get started with an overview.",
];

function SuggestionCard({
  icon: Icon,
  title,
  description,
  onSuggest,
}: (typeof SUGGESTIONS)[number]) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 transition-colors duration-150 hover:border-[rgba(255,106,26,0.5)]">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
          <Icon size={14} className="text-[var(--color-primary)]" />
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onSuggest}
            className="mt-2 h-7 self-end border-[var(--color-primary)] px-3 text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            Suggest
          </Button>
        </div>
      </div>
    </div>
  );
}

function CaptionResults({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-white">Caption suggestions</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close caption suggestions"
          className="cursor-pointer text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          <X size={12} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {CAPTION_SUGGESTIONS.map((caption) => (
          <div
            key={caption}
            className="flex items-center justify-between gap-2"
          >
            <p className="flex-1 text-xs italic text-[var(--color-text-muted)]">
              {caption}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  /* todo: apply caption as a text layer via timelineStore.addLayer */
                }}
                className="h-6 cursor-pointer rounded bg-[var(--color-primary)] px-2 text-[10px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => {
                  /* todo: nothing to discard until results are real */
                }}
                className="h-6 cursor-pointer rounded px-2 text-[10px] text-[var(--color-text-muted)] transition-colors hover:text-white"
              >
                Discard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiAssistTab() {
  const [tier1Open, setTier1Open] = useState(false);
  const [showResult, setShowResult] = useState(true);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <SuggestionCard {...SUGGESTIONS[0]} />
      {showResult && <CaptionResults onClose={() => setShowResult(false)} />}
      {SUGGESTIONS.slice(1).map((suggestion) => (
        <SuggestionCard key={suggestion.id} {...suggestion} />
      ))}

      <Button
        className="mt-1 h-9 w-full text-sm"
        onClick={() => setTier1Open(true)}
      >
        Generate with AI
      </Button>

      <Tier1Modal open={tier1Open} onOpenChange={setTier1Open} />
    </div>
  );
}
