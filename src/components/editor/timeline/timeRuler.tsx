export function TimeRuler({ totalDuration }: { totalDuration: number }) {
  return (
    <div className="relative h-7 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
      {Array.from({ length: Math.floor(totalDuration) + 1 }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-1 ml-0.5 font-mono text-xs leading-none text-[var(--color-text-muted)]"
          style={{ left: `${(i / totalDuration) * 100}%` }}
        >
          {i}s
        </span>
      ))}
    </div>
  );
}
