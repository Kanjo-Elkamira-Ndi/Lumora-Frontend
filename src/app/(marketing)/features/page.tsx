import Link from "next/link";
import {
  Captions,
  Check,
  FileCheck,
  Mic2,
  RefreshCw,
  Shuffle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const FEATURES = [
  {
    icon: Captions,
    pillClassName: "text-[var(--color-primary)]",
    name: "Auto-captions",
    description:
      "Lumora transcribes your video and generates karaoke-style word-level captions as an editable text layer.",
    bullets: [
      "Word-level timing accuracy",
      "Editable text layer on timeline",
      "Free — no generation credits",
    ],
    mockupLabel: "Captions layer preview",
    reversed: false,
  },
  {
    icon: Shuffle,
    pillClassName: "text-white",
    name: "Smart transitions",
    description:
      "Tell Lumora the mood and it picks the right cut — cross-dissolve, wipe, or hard cut. Always lands as a removable layer.",
    bullets: [
      "Context-aware suggestions",
      "One-click apply",
      "Swap or remove anytime",
    ],
    mockupLabel: "Transition suggestions",
    reversed: true,
  },
  {
    icon: Mic2,
    pillClassName: "text-[var(--color-primary)]",
    name: "AI voiceover & music generation",
    description:
      "Generate studio-quality voiceover or background music from a prompt. Lumora's agentic loop retries across providers until it passes quality checks.",
    bullets: [
      "ElevenLabs, Runway, Stability Audio",
      "3-attempt quality loop",
      "Waveform preview before accepting",
    ],
    mockupLabel: "Waveform preview",
    reversed: false,
    statCallout: true,
  },
  {
    icon: FileCheck,
    pillClassName: "text-white",
    name: "Provenance you can trust",
    description:
      "Every AI-generated asset carries a full manifest — prompt, provider, model, attempt number, sha256 hash — locked on Backblaze B2.",
    bullets: [
      "Immutable provenance record",
      "Per-asset manifest view",
      "Exportable audit trail",
    ],
    mockupLabel: "Manifest view",
    reversed: true,
  },
];

export default function FeaturesPage() {
  return (
    <main>
      <section className="px-16 pb-16 pt-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Features
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
          Every AI action is just an editable layer
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-muted)]">
          No black boxes. No baked outputs. Every generation lands on your
          timeline as something you own and can change.
        </p>
      </section>

      <section className="px-16">
        {FEATURES.map((feature) => (
          <div
            key={feature.name}
            className="grid items-center gap-16 py-20 md:grid-cols-2"
          >
            <div
              className={cn(
                feature.reversed && "md:order-last"
              )}
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                <feature.icon
                  className={cn("size-5", feature.pillClassName)}
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white">
                {feature.name}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
                {feature.description}
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <Check
                      className="size-4 shrink-0 text-[var(--color-primary)]"
                      strokeWidth={2.5}
                    />
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
              {feature.statCallout && (
                <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[#26262A] p-4">
                  <RefreshCw
                    className="size-4 shrink-0 text-[var(--color-primary)]"
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium text-white">
                    3-attempt agentic retry loop
                  </span>
                </div>
              )}
            </div>
            <div className={cn(feature.reversed && "md:order-first")}>
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#26262A]">
                <feature.icon
                  className="size-12 text-[var(--color-text-muted)]"
                  strokeWidth={1.25}
                />
                <span className="mt-3 text-sm text-[var(--color-text-muted)]">
                  {feature.mockupLabel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="px-16 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Ready to edit with AI?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            Start free with unlimited Tier 0 suggestions — no credit card
            required.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/signup">Start creating — free</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
