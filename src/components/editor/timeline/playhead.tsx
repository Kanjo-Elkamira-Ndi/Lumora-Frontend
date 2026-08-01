export function Playhead({
  containerWidth,
  labelWidth,
  position,
  totalDuration,
}: {
  containerWidth: number;
  labelWidth: number;
  position: number;
  totalDuration: number;
}) {
  if (!containerWidth) return null;
  const contentWidth = containerWidth - labelWidth;
  const left = Math.min(
    labelWidth + (position / totalDuration) * contentWidth,
    containerWidth
  );

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-[var(--color-primary)]"
      style={{ left }}
    >
      <div className="absolute -left-[4px] top-0 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-[var(--color-primary)]" />
    </div>
  );
}
