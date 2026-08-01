import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle,
  CloudUpload,
  Lock,
  RefreshCw,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Wand2,
    step: "Step 1",
    label: "Generate",
    description: "Prompt → Genblaze pipeline → raw media asset",
  },
  {
    icon: CheckCircle,
    step: "Step 2",
    label: "Evaluate",
    description: "ASR roundtrip, duration check, silence and clipping scan",
  },
  {
    icon: RefreshCw,
    step: "Step 3",
    label: "Retry",
    description: "Failed check? Route to next provider. Up to 3 attempts.",
  },
  {
    icon: CloudUpload,
    step: "Step 4",
    label: "Store",
    description: "Passed? Locked to Backblaze B2 with full provenance manifest.",
  },
];

const MANIFEST_ROWS = [
  { label: "Provider", value: "ElevenLabs" },
  { label: "Attempt", value: "2 of 3" },
  { label: "ASR Score", value: "0.94" },
];

const PRINCIPLES = [
  "Every AI output is a proposal — nothing on your timeline is final until you explicitly accept it. You stay in the director's chair.",
  "The agentic retry loop catches bad audio, mistimed captions, and clipping artifacts before they ever reach your editing surface.",
  "Full provenance means you can trace any AI asset back to the exact prompt, provider, model version, and attempt number — months after the fact.",
];

export default function HowItWorksPage() {
  return (
    <main>
      <section className="px-16 pb-16 pt-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          AI that hands you layers, not finished files.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-muted)]">
          Most AI editors bake the output and call it done. Lumora gives you
          something you can actually edit.
        </p>
      </section>

      <section className="mt-20 px-16">
        <div className="flex flex-col items-start justify-center md:flex-row">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center md:flex-row md:items-start">
              {index > 0 && (
                <ArrowRight
                  aria-hidden
                  className="mx-4 mt-6 size-6 flex-shrink-0 rotate-90 self-center text-[var(--color-primary)] md:rotate-0 md:self-auto"
                  strokeWidth={2}
                />
              )}
              <div className="flex max-w-[160px] flex-col items-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#FF6A1A] bg-[var(--color-surface-2)]">
                  <step.icon
                    className="size-7 text-[var(--color-primary)]"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                  {step.step}
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">
                  {step.label}
                </h3>
                <p className="mt-2 text-center text-sm leading-snug text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-28 grid grid-cols-1 gap-16 px-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Human-in-the-loop, always
          </h2>
          {PRINCIPLES.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">Asset Provenance</span>
            <Lock
              aria-hidden
              className="size-[14px] text-[var(--color-primary)]"
              strokeWidth={2}
            />
          </div>
          <div className="mt-3 mb-4 border-t border-[var(--color-border)]" />
          <dl>
            {MANIFEST_ROWS.map((row) => (
              <div key={row.label} className="mt-2 flex items-center justify-between">
                <dt className="text-sm text-[var(--color-text-muted)]">
                  {row.label}
                </dt>
                <dd className="font-mono text-sm text-white">{row.value}</dd>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between">
              <dt className="text-sm text-[var(--color-text-muted)]">Duration</dt>
              <dd className="flex items-center gap-1.5 font-mono text-sm text-white">
                <Check aria-hidden className="size-[14px]" strokeWidth={2.5} />
                Passed
              </dd>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <dt className="text-sm text-[var(--color-text-muted)]">Status</dt>
              <dd className="flex items-center gap-1.5 font-mono text-sm text-[var(--color-success)]">
                <Check
                  aria-hidden
                  className="size-[14px] text-[var(--color-success)]"
                  strokeWidth={2.5}
                />
                Passed
              </dd>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <dt className="text-sm text-[var(--color-text-muted)]">Manifest</dt>
              <dd className="flex items-center gap-1 font-mono text-sm text-white">
                <Lock
                  aria-hidden
                  className="size-3 text-[var(--color-primary)]"
                  strokeWidth={2.5}
                />
                Locked
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Stored on Backblaze B2 with Object Lock enabled
          </p>
        </div>
      </section>

      <section className="relative mt-28 overflow-hidden px-16 py-20">
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
            Ready to try it?
          </h2>
          <p className="mt-4 text-[var(--color-text-muted)]">
            Free to start. No credit card required.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/signup">Start for free</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
