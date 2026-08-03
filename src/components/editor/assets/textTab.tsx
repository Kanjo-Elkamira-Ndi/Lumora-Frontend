"use client";

import { useState } from "react";
import { Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextStyleControls } from "@/components/editor/properties/textStyleControls";
import { toastError } from "@/lib/utils/toast";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";

const DEFAULT_PROPS: Record<string, unknown> = {
  content: "",
  fontFamily: "Inter",
  size: 48,
  color: "#FFFFFF",
  bgColor: null,
  position: { x: 0.5, y: 0.9 },
  rotation: 0,
  opacity: 1,
  box: false,
  boxColor: "#000000",
  boxBorderW: 8,
  outlineWidth: 0,
  outlineColor: "#000000",
  shadowX: 0,
  shadowY: 0,
  shadowColor: "#000000",
};

export function TextTab() {
  const timeline = useTimelineStore((s) => s.timeline);
  const addLayer = useTimelineStore((s) => s.addLayer);
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const [props, setProps] = useState<Record<string, unknown>>(DEFAULT_PROPS);

  const content = String(props.content ?? "");

  const handleChange = (field: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    const track = timeline?.tracks.find((t) => t.type === "text");
    if (!track) {
      toastError("No text track in this timeline");
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) {
      toastError("Enter some text first");
      return;
    }
    const startMs = Math.max(0, Math.round(playheadPosition * 1000));
    addLayer(track.id, {
      id: `tmp_${Date.now()}`,
      type: "text",
      label: trimmed.slice(0, 60),
      source: "manual",
      startMs,
      durationMs: 5000,
      props: {
        ...props,
        content: trimmed,
        startTime: startMs / 1000,
        duration: 5,
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Type size={14} className="text-[var(--color-primary)]" />
          <h3 className="text-sm font-medium text-white">Add text overlay</h3>
        </div>

        <Textarea
          rows={2}
          placeholder="Your text here…"
          value={content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="mb-4 text-sm"
        />

        <TextStyleControls props={props} onChange={handleChange} />

        <Button className="mt-4 h-9 w-full text-sm" onClick={handleAdd}>
          Add to Timeline
        </Button>
      </div>
    </div>
  );
}
