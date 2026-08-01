export default function EditorLoading() {
  return (
    <div className="grid h-screen animate-pulse grid-rows-[56px_1fr_220px] overflow-hidden bg-[var(--color-neutral)]">
      <div className="bg-[var(--color-surface-1)]" />
      <div className="grid grid-cols-[280px_1fr_300px]">
        <div className="border-r border-[var(--color-border)] bg-[var(--color-surface-0)]" />
        <div className="bg-[var(--color-neutral)]" />
        <div className="border-l border-[var(--color-border)] bg-[var(--color-surface-0)]" />
      </div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-1)]" />
    </div>
  );
}
