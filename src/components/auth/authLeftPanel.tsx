type AuthLeftPanelProps = {
  tagline: string;
  bottomSlot: React.ReactNode;
};

export function AuthLeftPanel({ tagline, bottomSlot }: AuthLeftPanelProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden px-16 py-16"
      style={{
        background: "linear-gradient(135deg, #1D1D20 0%, #141416 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,26,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight text-white">
            Lumora
          </p>
          <p className="mt-4 max-w-md text-2xl font-semibold leading-snug text-white">
            {tagline}
          </p>
        </div>
        <div>{bottomSlot}</div>
      </div>
    </div>
  );
}
