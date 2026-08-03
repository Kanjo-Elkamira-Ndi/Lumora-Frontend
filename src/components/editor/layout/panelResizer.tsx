"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type Axis = "vertical" | "horizontal";

type PanelResizerProps = {
  axis: Axis;
  onResize: (delta: number) => void;
  ariaLabel: string;
};

const RESIZE_STEP = 10;
const RESIZE_STEP_LARGE = 40;

export function PanelResizer({ axis, onResize, ariaLabel }: PanelResizerProps) {
  const [dragging, setDragging] = useState(false);
  const lastPosRef = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      lastPosRef.current = axis === "vertical" ? e.clientX : e.clientY;
      setDragging(true);
    },
    [axis]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (lastPosRef.current === null) return;
      const current = axis === "vertical" ? e.clientX : e.clientY;
      const delta = current - lastPosRef.current;
      lastPosRef.current = current;
      onResize(delta);
    },
    [axis, onResize]
  );

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      lastPosRef.current = null;
      setDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
      const isVertical = axis === "vertical";
      const positive =
        isVertical && e.key === "ArrowRight"
          ? true
          : isVertical && e.key === "ArrowLeft"
            ? false
            : !isVertical && e.key === "ArrowDown"
              ? true
              : !isVertical && e.key === "ArrowUp"
                ? false
                : null;
      if (positive === null) return;
      e.preventDefault();
      onResize(positive ? step : -step);
    },
    [axis, onResize]
  );

  return (
    <div
      role="separator"
      aria-orientation={axis === "vertical" ? "vertical" : "horizontal"}
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative z-10 flex shrink-0 touch-none items-center justify-center bg-[var(--color-surface-1)] outline-none focus-visible:bg-[var(--color-primary)]",
        axis === "vertical" ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
      )}
    >
      <div
        className={cn(
          "bg-[var(--color-border)] transition-colors duration-150 group-hover:bg-[var(--color-primary)] group-focus-visible:bg-[var(--color-primary)]",
          axis === "vertical" ? "h-full w-px" : "h-px w-full"
        )}
        style={{ boxShadow: dragging ? "0 0 0 1px var(--color-primary)" : undefined }}
      />
    </div>
  );
}
