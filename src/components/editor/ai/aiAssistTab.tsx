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
import { listAssets, transcribeAsset } from "@/lib/api/assets";
import {
  createTier0Job,
  type Tier0Kind,
  waitForJob,
} from "@/lib/api/jobs";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";
import type { Layer } from "@/types";

import { Tier1Modal } from "./tier1Modal";

type CutPoint = {
  position: number;
  reason: string;
  confidence: number;
};

type AppliedResult = {
  label: string;
  detail: string;
};

export function AiAssistTab() {
  const [tier1Open, setTier1Open] = useState(false);
  const projectId = useEditorStore((s) => s.projectId);
  const timeline = useTimelineStore((s) => s.timeline);
  const addLayer = useTimelineStore((s) => s.addLayer);

  const [busy, setBusy] = useState<Tier0Kind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, AppliedResult>>({});
  const [cutPoints, setCutPoints] = useState<CutPoint[]>([]);

  const trackByType = (type: Layer["type"]) =>
    timeline?.tracks.find((track) => track.type === type) ?? null;

  const runSuggestion = async (
    id: Tier0Kind,
    fn: () => Promise<AppliedResult | { cutPoints: CutPoint[] }>
  ) => {
    setBusy(id);
    setError(null);
    try {
      const result = await fn();
      if ("cutPoints" in result) {
        setCutPoints(result.cutPoints);
      } else {
        setApplied((prev) => ({ ...prev, [id]: result }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggestion failed");
    } finally {
      setBusy(null);
    }
  };

  const handleCaptions = () =>
    runSuggestion("caption", async () => {
      if (!projectId) throw new Error("No project selected");
      const { assets } = await listAssets(projectId);
      const media = assets.find(
        (asset) =>
          asset.mimeType.startsWith("audio/") ||
          asset.mimeType.startsWith("video/")
      );
      if (!media) throw new Error("Upload an audio or video asset first");

      const { words } = await transcribeAsset(media.id);
      if (words.length === 0) throw new Error("No speech detected");
      const transcript = words.map((w) => w.word).join(" ");

      const job = await createTier0Job(
        projectId,
        "caption",
        JSON.stringify({ transcript, wordTimings: words })
      );
      const done = await waitForJob(job.id);
      if (done.status !== "completed") {
        throw new Error(done.error ?? "Caption job failed");
      }
      const result = done.result?.result as Record<string, unknown> | undefined;
      const track = trackByType("text");
      if (!track) throw new Error("No text track in this timeline");

      addLayer(track.id, {
        id: `tmp_${Date.now()}`,
        type: "text",
        label: String(result?.text ?? transcript).slice(0, 60),
        source: "llm_suggested",
        startMs: Math.round(Number(result?.startTime ?? 0) * 1000),
        durationMs: Math.round(Number(result?.duration ?? 5) * 1000),
        props: {
          content: result?.text ?? transcript,
          font: result?.font ?? "Arial",
          size: result?.size ?? 48,
          color: result?.color ?? "white",
          bgColor: result?.bgColor ?? null,
          position: result?.position ?? { x: 0.5, y: 0.9 },
          startTime: Number(result?.startTime ?? 0),
          duration: Number(result?.duration ?? 5),
        },
      });
      return {
        label: "Captions applied",
        detail: `Added a caption layer for ${words.length} words.`,
      };
    });

  const handleTransitions = () =>
    runSuggestion("transition", async () => {
      if (!projectId) throw new Error("No project selected");
      const track = trackByType("video");
      const clips = track?.layers.filter((layer) => layer.type === "video") ?? [];
      const [clipA, clipB] = clips;
      if (!clipA || !clipB) throw new Error("Add at least two video clips first");

      const meta = (layer: Layer) => ({
        assetId: layer.assetId ?? layer.props?.assetId ?? "",
        startTime: layer.startMs / 1000,
        duration: layer.durationMs / 1000,
        name: layer.label,
      });

      const job = await createTier0Job(
        projectId,
        "transition",
        JSON.stringify({ clipA: meta(clipA), clipB: meta(clipB) })
      );
      const done = await waitForJob(job.id);
      if (done.status !== "completed") {
        throw new Error(done.error ?? "Transition job failed");
      }
      const result = done.result?.result as Record<string, unknown> | undefined;
      const effectTrack = trackByType("effect");
      if (!effectTrack) throw new Error("No effects track in this timeline");
      const transitionType = String(result?.type ?? "fade");

      addLayer(effectTrack.id, {
        id: `tmp_${Date.now()}`,
        type: "effect",
        label: transitionType,
        source: "llm_suggested",
        startMs: clipA.startMs,
        durationMs: Math.round(Number(result?.duration ?? 1) * 1000),
        props: {
          type: transitionType,
          filterType: transitionType,
          duration: Number(result?.duration ?? 1),
          easing: result?.easing ?? "linear",
        },
      });
      return {
        label: "Transition applied",
        detail: `Added a ${transitionType} transition at ${(clipA.startMs / 1000).toFixed(1)}s.`,
      };
    });

  const handleCut = () =>
    runSuggestion("cut_points", async () => {
      if (!projectId) throw new Error("No project selected");
      const summary = (timeline?.tracks ?? []).map((track) => ({
        kind: track.type,
        layers: track.layers.map((layer) => ({
          label: layer.label,
          start: layer.startMs / 1000,
          duration: layer.durationMs / 1000,
        })),
      }));
      const job = await createTier0Job(
        projectId,
        "cut_points",
        JSON.stringify({ timeline: summary, targetDuration: 30 })
      );
      const done = await waitForJob(job.id);
      if (done.status !== "completed") {
        throw new Error(done.error ?? "Cut point job failed");
      }
      const points = (done.result?.result ?? []) as CutPoint[];
      if (points.length === 0) throw new Error("No cut points suggested");
      setCutPoints(points);
      return { cutPoints: points };
    });

  const handleTitle = () =>
    runSuggestion("motion_spec", async () => {
      if (!projectId) throw new Error("No project selected");
      const job = await createTier0Job(
        projectId,
        "motion_spec",
        JSON.stringify({ style: "cinematic", layerType: "text" })
      );
      const done = await waitForJob(job.id);
      if (done.status !== "completed") {
        throw new Error(done.error ?? "Title card job failed");
      }
      const result = done.result?.result as Record<string, unknown> | undefined;
      const track = trackByType("text");
      if (!track) throw new Error("No text track in this timeline");

      addLayer(track.id, {
        id: `tmp_${Date.now()}`,
        type: "text",
        label: "Title card",
        source: "llm_suggested",
        startMs: 0,
        durationMs: Math.round(Number(result?.duration ?? 3) * 1000),
        props: {
          content: "Your Title Here",
          keyframes: result?.keyframes ?? [],
          easing: result?.easing ?? "linear",
          duration: Number(result?.duration ?? 3),
          startTime: 0,
        },
      });
      return {
        label: "Title card applied",
        detail: "Added an animated title text layer at the start.",
      };
    });

  const suggestions: {
    id: Tier0Kind;
    icon: LucideIcon;
    title: string;
    description: string;
    onSuggest: () => void;
  }[] = [
    {
      id: "caption",
      icon: Captions,
      title: "Auto-generate captions",
      description: "Transcribe your video and add word-level caption layers.",
      onSuggest: handleCaptions,
    },
    {
      id: "transition",
      icon: Shuffle,
      title: "Suggest transitions",
      description: "AI picks the right cut for the mood of each scene.",
      onSuggest: handleTransitions,
    },
    {
      id: "cut_points",
      icon: Scissors,
      title: "Smart cut points",
      description: "Find the best 30-second highlight from your footage.",
      onSuggest: handleCut,
    },
    {
      id: "motion_spec",
      icon: Type,
      title: "Generate title card",
      description: "AI writes and styles an opening title layer.",
      onSuggest: handleTitle,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      {error && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-xs text-red-400">
          {error}
        </div>
      )}
      {suggestions.map((suggestion) => {
        const isBusy = busy === suggestion.id;
        const result = applied[suggestion.id];
        return (
          <SuggestionCard
            key={suggestion.id}
            icon={suggestion.icon}
            title={suggestion.title}
            description={suggestion.description}
            busy={isBusy}
            result={result}
            onSuggest={suggestion.onSuggest}
          />
        );
      })}

      {cutPoints.length > 0 && (
        <CutPointsResult
          points={cutPoints}
          onClose={() => setCutPoints([])}
        />
      )}

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

function SuggestionCard({
  icon: Icon,
  title,
  description,
  busy,
  result,
  onSuggest,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  busy: boolean;
  result?: AppliedResult;
  onSuggest: () => void;
}) {
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
          {result && (
            <div className="mt-2 rounded-lg bg-[var(--color-surface-3)] px-3 py-2">
              <p className="text-xs font-medium text-[var(--color-primary)]">
                {result.label}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {result.detail}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSuggest}
            disabled={busy}
            className="mt-2 h-7 self-end border-[var(--color-primary)] px-3 text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            {busy ? "Working…" : "Suggest"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CutPointsResult({
  points,
  onClose,
}: {
  points: CutPoint[];
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-white">Cut points</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cut points"
          className="cursor-pointer text-[var(--color-text-muted)] transition-colors hover:text-white"
        >
          <X size={12} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {points.map((point) => (
          <div
            key={`${point.position}-${point.confidence}`}
            className="flex items-center justify-between gap-2"
          >
            <p className="flex-1 text-xs text-[var(--color-text-muted)]">
              <span className="font-medium text-white">
                {point.position.toFixed(1)}s
              </span>{" "}
              — {point.reason || "Suggested cut"}
            </p>
            <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
              {(point.confidence * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
