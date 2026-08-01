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

import { AgenticProgressDrawer } from "./agenticProgressDrawer";

const VOICES = ["Aria (natural)", "Marcus (deep)", "Zoe (energetic)"];

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
                className="border-[var(--color-border)] bg-[var(--color-surface-2)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
                  Voice
                </label>
                <Select defaultValue="Aria (natural)">
                  <SelectTrigger className="bg-[var(--color-surface-2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
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
            <Button
              onClick={() => {
                onOpenChange(false);
                setDrawerOpen(true);
                console.log("Tier 1 generate — mock");
              }}
            >
              Generate
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
