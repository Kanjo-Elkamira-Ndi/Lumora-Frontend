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
import { createTier1Job } from "@/lib/api/jobs";
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

export function Tier1Modal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(VOICES[0]);
  const [submitting, setSubmitting] = useState(false);
  const projectId = useEditorStore((s) => s.projectId);
  const setActiveJob = useAiUiStore((s) => s.setActiveJob);

  const handleGenerate = async () => {
    if (!projectId) {
      toastError("No project selected");
      return;
    }
    if (!script.trim()) {
      toastError("Enter a script first");
      return;
    }
    setSubmitting(true);
    try {
      const { jobId } = await createTier1Job(projectId, "voiceover", {
        script,
        voiceConfig: { voiceId: VOICE_TO_BACKEND[voice] ?? "Ashley" },
      });
      setActiveJob({ jobId, kind: "voiceover" });
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
              Generate voiceover
            </DialogTitle>
          </div>

          <div className="flex flex-col gap-5 px-6 py-6">
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
