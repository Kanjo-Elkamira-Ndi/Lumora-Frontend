export function Playhead({
  labelWidth,
  position,
  pxPerSec,
}: {
  labelWidth: number;
  position: number;
  pxPerSec: number;
}) {
  const left = labelWidth + position * pxPerSec;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-50 w-[2px] bg-[var(--color-primary)]"
      style={{ left }}
    >
      <div className="absolute -left-[4px] top-0 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-[var(--color-primary)]" />
    </div>
  );
}
