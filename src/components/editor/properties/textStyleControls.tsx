"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils/cn";

const FONT_FAMILIES = [
  "Inter",
  "Montserrat",
  "Source Code Pro",
  "Open Sans",
  "Liberation Sans",
  "Liberation Serif",
  "DejaVu Sans",
  "Arial",
];

const SWATCHES = [
  "#FFFFFF",
  "#000000",
  "#FF6A1A",
  "#FFFF00",
  "#FF0000",
  "#00FF00",
  "#00FFFF",
  "#FF00FF",
];

const POSITION_PRESETS: { label: string; value: { x: number; y: number } }[] = [
  { label: "Top", value: { x: 0.5, y: 0.1 } },
  { label: "Center", value: { x: 0.5, y: 0.5 } },
  { label: "Bottom", value: { x: 0.5, y: 0.9 } },
];

function posFromProps(props: Record<string, unknown>): { x: number; y: number } {
  const p = props.position;
  if (typeof p === "object" && p !== null) {
    const { x, y } = p as Record<string, number>;
    return { x: Number(x ?? 0.5), y: Number(y ?? 0.9) };
  }
  return { x: 0.5, y: 0.9 };
}

function num(props: Record<string, unknown>, key: string, fallback: number): number {
  const v = Number(props[key]);
  return Number.isFinite(v) ? v : fallback;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
      {children}
    </label>
  );
}

function Swatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const normalized = value.toLowerCase();
  return (
    <div className="flex flex-wrap gap-1.5">
      {SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Color ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            "size-5 cursor-pointer rounded-full border border-black/40 transition-transform hover:scale-110",
            normalized === color.toLowerCase() && "ring-2 ring-[var(--color-primary)]"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function TextStyleControls({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  const pos = posFromProps(props);
  const opacity = num(props, "opacity", 1);
  const rotation = num(props, "rotation", 0);
  const outlineWidth = num(props, "outlineWidth", 0);
  const outlineColor = String(props.outlineColor ?? "black");
  const shadowX = num(props, "shadowX", 0);
  const shadowY = num(props, "shadowY", 0);
  const shadowColor = String(props.shadowColor ?? "black");
  const box = Boolean(props.box);
  const boxColor = String(props.boxColor ?? "black");
  const boxBorderW = num(props, "boxBorderW", 8);

  const setPosition = (next: { x?: number; y?: number }) =>
    onChange("position", { x: next.x ?? pos.x, y: next.y ?? pos.y });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel>Font Family</FieldLabel>
        <Select
          value={String(props.fontFamily ?? "Inter")}
          onValueChange={(v) => onChange("fontFamily", v)}
        >
          <SelectTrigger className="h-8 px-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Font Size</FieldLabel>
          <input
            type="number"
            min={8}
            max={240}
            aria-label="Font Size"
            value={num(props, "size", 48)}
            onChange={(e) => onChange("size", Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1.5 text-xs text-white focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div>
          <FieldLabel>Opacity</FieldLabel>
          <div className="flex items-center gap-2 pt-1.5">
            <Slider
              aria-label="Opacity"
              value={[Math.round(opacity * 100)]}
              min={0}
              max={100}
              onValueChange={(v) => onChange("opacity", v[0] / 100)}
            />
            <span className="w-9 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Color</FieldLabel>
        <Swatches
          value={String(props.color ?? "#FFFFFF")}
          onChange={(color) => onChange("color", color)}
        />
      </div>

      <div>
        <FieldLabel>Rotation</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Rotation"
            value={[rotation]}
            min={-180}
            max={180}
            onValueChange={(v) => onChange("rotation", v[0])}
          />
          <span className="w-9 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            {rotation}°
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <FieldLabel>Background Box</FieldLabel>
          <input
            type="checkbox"
            aria-label="Background Box"
            checked={box}
            onChange={(e) => onChange("box", e.target.checked)}
            className="accent-[#FF6A1A]"
          />
        </div>
        {box && (
          <div className="mt-2 flex flex-col gap-3">
            <Swatches
              value={boxColor}
              onChange={(color) => onChange("boxColor", color)}
            />
            <div>
              <FieldLabel>Box Padding</FieldLabel>
              <Slider
                aria-label="Box Padding"
                value={[boxBorderW]}
                min={0}
                max={40}
                onValueChange={(v) => onChange("boxBorderW", v[0])}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Outline</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Outline Width"
            value={[outlineWidth]}
            min={0}
            max={10}
            onValueChange={(v) => onChange("outlineWidth", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            {outlineWidth}
          </span>
        </div>
        {outlineWidth > 0 && (
          <div className="mt-2">
            <Swatches
              value={outlineColor}
              onChange={(color) => onChange("outlineColor", color)}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Shadow</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Shadow X"
            value={[shadowX]}
            min={-20}
            max={20}
            onValueChange={(v) => onChange("shadowX", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            x{shadowX}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Slider
            aria-label="Shadow Y"
            value={[shadowY]}
            min={-20}
            max={20}
            onValueChange={(v) => onChange("shadowY", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            y{shadowY}
          </span>
        </div>
        {(shadowX !== 0 || shadowY !== 0) && (
          <div className="mt-2">
            <Swatches
              value={shadowColor}
              onChange={(color) => onChange("shadowColor", color)}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Position</FieldLabel>
        <div className="mb-2 flex gap-1.5">
          {POSITION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPosition(preset.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-md border border-[var(--color-border)] py-1 text-[10px] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                Math.abs(pos.x - preset.value.x) < 0.01 &&
                  Math.abs(pos.y - preset.value.y) < 0.01 &&
                  "border-[var(--color-primary)] text-[var(--color-primary)]"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Position X"
            value={[Math.round(pos.x * 100)]}
            min={0}
            max={100}
            onValueChange={(v) => setPosition({ x: v[0] / 100 })}
          />
          <span className="w-8 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            x{Math.round(pos.x * 100)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Slider
            aria-label="Position Y"
            value={[Math.round(pos.y * 100)]}
            min={0}
            max={100}
            onValueChange={(v) => setPosition({ y: v[0] / 100 })}
          />
          <span className="w-8 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            y{Math.round(pos.y * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
