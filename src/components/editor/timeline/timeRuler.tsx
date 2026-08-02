const NICE_INTERVALS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200,
];

const MIN_LABEL_GAP_PX = 72;

function pickTickInterval(totalDuration: number, pxPerSec: number) {
  const targetSeconds = MIN_LABEL_GAP_PX / Math.max(pxPerSec, 0.001);
  for (const interval of NICE_INTERVALS) {
    if (targetSeconds <= interval) return interval;
  }
  return NICE_INTERVALS[NICE_INTERVALS.length - 1];
}

function formatTick(seconds: number) {
  const s = Math.floor(seconds);
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return m ? `${h}h${m}m` : `${h}h`;
  }
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem ? `${m}:${String(rem).padStart(2, "0")}` : `${m}m`;
  }
  return `${s}s`;
}

export function TimeRuler({
  totalDuration,
  pxPerSec,
}: {
  totalDuration: number;
  pxPerSec: number;
}) {
  const interval = pickTickInterval(totalDuration, pxPerSec);
  const ticks: number[] = [];
  for (let t = 0; t <= totalDuration; t += interval) {
    ticks.push(t);
  }

  return (
    <div
      data-testid="timeline-ruler"
      className="relative h-7 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]"
    >
      {ticks.map((t) => (
        <div
          key={t}
          className="pointer-events-none absolute inset-y-0 w-px bg-[var(--color-border)]"
          style={{ left: `${t * pxPerSec}px` }}
        >
          <span className="absolute bottom-1 left-1.5 whitespace-nowrap font-mono text-[10px] leading-none text-[var(--color-text-muted)]">
            {formatTick(t)}
          </span>
        </div>
      ))}
    </div>
  );
}
