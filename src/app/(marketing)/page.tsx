"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SLIDES = ["Editor UI", "Timeline View", "AI Generation", "Asset Library"];

const AUTO_ADVANCE_MS = 3500;

export default function HomePage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[var(--color-neutral)] px-6 py-24 md:flex-row md:px-16 md:py-0">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[44vw] w-[44vw] -translate-x-1/2 -translate-y-1/2 rounded-full md:left-[28%]"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 106, 26, 0.05) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex w-full max-w-xl flex-col justify-center md:mr-12 md:w-1/2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          AI-Powered Video Editing
        </p>
        <h1 className="mt-6 max-w-[520px] text-[clamp(40px,4vw,64px)] font-bold leading-[1.05] tracking-tight text-white">
          Edit with AI. Stay in control.
        </h1>
        <p className="mt-4 max-w-[480px] text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Lumora proposes editable layers, never final pixels. Every AI action
          lands on your timeline as something you can move, cut, or delete.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href="/signup">Start creating — free</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="#demo">
              <Play className="size-4" />
              Watch demo
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative mt-16 w-full max-w-2xl md:ml-12 md:mt-0 md:w-1/2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#26262A] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          {SLIDES.map((label, index) => (
            <div
              key={label}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out",
                index === active
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              )}
            >
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                {label}
              </span>
            </div>
          ))}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#141416] to-transparent opacity-60"
          />
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {SLIDES.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-label={`Go to slide ${index + 1}: ${label}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  index === active
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/25 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
