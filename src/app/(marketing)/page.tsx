"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  MonitorPlay,
  Play,
  ShieldCheck,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SLIDES = ["Editor UI", "Timeline View", "AI Generation", "Asset Library"];

const AUTO_ADVANCE_MS = 3500;

const POWERED_BY = [
  "Genblaze",
  "Backblaze B2",
  "ElevenLabs",
  "Runway",
  "Stability AI",
];

const FEATURES = [
  {
    icon: Wand2,
    title: "AI suggests",
    body: "Describe what you want. Lumora generates audio, video, captions, and transitions as proposals on your timeline.",
    iconClassName: "text-[var(--color-primary)]",
  },
  {
    icon: Layers,
    title: "You control",
    body: "Every suggestion lands as an editable layer. Move it, trim it, delete it.",
    iconClassName: "text-white",
  },
  {
    icon: ShieldCheck,
    title: "Always traceable",
    body: "Every AI asset carries a provenance manifest. Know exactly what model made what.",
    iconClassName: "text-white",
  },
];

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
    <>
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

      <section className="relative border-y border-[var(--color-border)] bg-[var(--color-surface-1)] py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--color-surface-1)] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-surface-1)] to-transparent"
        />
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          Powered by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10">
          {POWERED_BY.map((name) => (
            <div
              key={name}
              className="rounded-md bg-[#26262A] px-6 py-3 text-xs text-[var(--color-text-muted)]"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="px-16 py-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          How it works
        </p>
        <h2 className="mt-4 text-center text-4xl font-bold tracking-tight text-white">
          From prompt to editable layer — in seconds
        </h2>
        <p className="mx-auto mt-4 mb-12 max-w-2xl text-center text-lg text-[var(--color-text-muted)]">
          Describe your idea once. Lumora handles the busywork and hands you a
          timeline you still fully own.
        </p>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
            >
              <feature.icon
                className={cn("mb-4 size-7", feature.iconClassName)}
                strokeWidth={1.75}
              />
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-base text-[var(--color-text-muted)]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="px-16 py-24">
        <h2 className="text-center text-4xl font-bold tracking-tight text-white">
          See it in action
        </h2>
        <p className="mx-auto mt-4 mb-12 max-w-2xl text-center text-lg text-[var(--color-text-muted)]">
          A first look at the Lumora editor. Every AI generation drops onto the
          timeline as an editable layer.
        </p>
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#26262A] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="flex h-10 items-center gap-4 px-4">
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#EF4444]" />
              <span className="size-3 rounded-full bg-[#EAB308]" />
              <span className="size-3 rounded-full bg-[#22C55E]" />
            </div>
            <div className="mx-auto w-64 rounded bg-[#141416] px-4 py-1 text-center text-xs text-[var(--color-text-muted)]">
              lumora.app/editor
            </div>
          </div>
          <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-b-xl bg-[#141416]">
            <MonitorPlay
              className="size-16 text-[var(--color-text-muted)]"
              strokeWidth={1.25}
            />
            <span className="text-sm text-[var(--color-text-muted)]">
              Editor preview
            </span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-16 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[44vw] w-[44vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 106, 26, 0.05) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Start editing smarter today.
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Free to start. No credit card required.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/signup">Create your free account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
