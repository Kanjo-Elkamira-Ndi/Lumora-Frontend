"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTier1Job, type Tier1Kind } from "@/lib/api/jobs";
import { toastError } from "@/lib/utils/toast";
import { useAiUiStore } from "@/stores/aiUiStore";
import { useEditorStore } from "@/stores/editorStore";

import { AgenticProgressDrawer } from "./agenticProgressDrawer";

const VOICES = ["Aria (natural)", "Marcus (deep)", "Zoe (energetic)"];

const VOICE_TO_BACKEND: Record<string, string> = {
  "Aria (natural)": "Ashley",
  "Marcus (deep)": "Ronald",
  "Zoe (energetic)": "Ashley",
};

const PROVIDERS = [
  "Auto (best available)",
  "ElevenLabs",
  "GMI Cloud",
  "Stability Audio",
];

const MODES: { kind: Tier1Kind; label: string }[] = [
  { kind: "voiceover", label: "Voiceover" },
  { kind: "music", label: "Music" },
  { kind: "image", label: "Image" },
  { kind: "video", label: "Video" },
];

const IMAGE_SIZES = ["1024x1024", "1024x576", "576x1024"];

const MUSIC_DURATIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
];

const VIDEO_DURATIONS = [
  { label: "2s", value: 2 },
  { label: "5s", value: 5 },
  { label: "10s", value: 10 },
];

export function Tier1Modal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<Tier1Kind>("voiceover");
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(VOICES[0]);
  const [prompt, setPrompt] = useState("");
  const [imageSize, setImageSize] = useState(IMAGE_SIZES[0]);
  const [musicDuration, setMusicDuration] = useState(30);
  const [videoDuration, setVideoDuration] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const projectId = useEditorStore((s) => s.projectId);
  const setActiveJob = useAiUiStore((s) => s.setActiveJob);

  const handleGenerate = async () => {
    if (!projectId) {
      toastError("No project selected");
      return;
    }
    if (mode === "voiceover") {
      if (!script.trim()) {
        toastError("Enter a script first");
        return;
      }
    } else if (!prompt.trim()) {
      toastError("Enter a prompt first");
      return;
    }
    setSubmitting(true);
    try {
      const payload =
        mode === "voiceover"
          ? {
              script,
              voiceConfig: { voiceId: VOICE_TO_BACKEND[voice] ?? "Ashley" },
            }
          : mode === "music"
            ? { prompt, duration: musicDuration }
            : mode === "image"
              ? { prompt, size: imageSize }
              : { prompt, duration: videoDuration };
      const { jobId } = await createTier1Job(projectId, mode, payload);
      setActiveJob({ jobId, kind: mode });
      setSubmitting(false);
      onOpenChange(false);
      setDrawerOpen(true);
    } catch (error) {
      setSubmitting(false);
      toastError(
        error instanceof Error ? error.message : "Failed to start generation"
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[560px]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <DialogTitle className="text-lg font-semibold">
              Generate {mode}
            </DialogTitle>
          </div>

          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex gap-1 rounded-lg bg-[var(--color-surface-2)] p-1">
              {MODES.map((m) => (
                <button
                  key={m.kind}
                  type="button"
                  onClick={() => setMode(m.kind)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === m.kind
                      ? "bg-[var(--color-surface-1)] text-[var(--color-text)] shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "voiceover" ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                    Script
                  </label>
                  <Textarea
                    rows={6}
                    placeholder="Type the script for your voiceover..."
                    value={script}
                    onChange={(event) => setScript(event.target.value)}
                    className="border-[var(--color-border)] bg-[var(--color-surface-2)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                      Voice
                    </label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger className="bg-[var(--color-surface-2)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                      Provider
                    </label>
                    <Select defaultValue="Auto (best available)">
                      <SelectTrigger className="bg-[var(--color-surface-2)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                    Prompt
                  </label>
                  <Textarea
                    rows={6}
                    placeholder={
                      mode === "image"
                        ? "Describe the image you want to create..."
                        : mode === "video"
                          ? "Describe the video you want to create..."
                          : "Describe the music style, mood, or genre..."
                    }
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="border-[var(--color-border)] bg-[var(--color-surface-2)]"
                  />
                </div>

                {mode === "image" && (
                  <div>
                    <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                      Size
                    </label>
                    <Select value={imageSize} onValueChange={setImageSize}>
                      <SelectTrigger className="bg-[var(--color-surface-2)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {mode === "music" && (
                  <div>
                    <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                      Duration
                    </label>
                    <Select
                      value={String(musicDuration)}
                      onValueChange={(value) =>
                        setMusicDuration(Number(value))
                      }
                    >
                      <SelectTrigger className="bg-[var(--color-surface-2)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSIC_DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {mode === "video" && (
                  <div>
                    <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                      Duration
                    </label>
                    <Select
                      value={String(videoDuration)}
                      onValueChange={(value) =>
                        setVideoDuration(Number(value))
                      }
                    >
                      <SelectTrigger className="bg-[var(--color-surface-2)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-2)] px-3 py-2">
              <Zap size={14} className="text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text-muted)]">
                This will use generation credits.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={submitting}>
              {submitting ? "Starting…" : "Generate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AgenticProgressDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
