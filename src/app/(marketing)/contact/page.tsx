import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactForm } from "./contact-form";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    body: "sales@lumina.app",
    meta: "For plans, enterprise, and partnerships",
  },
  {
    icon: Clock,
    title: "Response time",
    body: "Within one business day",
    meta: "Mon–Fri, 9am–6pm CET",
  },
];

export default function ContactPage() {
  return (
    <main>
      <section className="px-16 pb-16 pt-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Contact
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
          Talk to the Lumora team
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-muted)]">
          Questions about credits, custom plans, or bringing Lumora to your
          team? We&apos;re happy to help.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-12 px-16 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          {CHANNELS.map(({ icon: Icon, title, body, meta }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-1)]">
                <Icon
                  aria-hidden
                  className="size-5 text-[var(--color-primary)]"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-1 text-[var(--color-text-primary)]">{body}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {meta}
              </p>
            </div>
          ))}

          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Prefer a live walkthrough?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                Book a 20-minute demo and we&apos;ll walk through the editor,
                the agentic retry loop, and provenance on your own footage.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="mt-6 w-full">
              <Link href="/signup">
                Book a demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
