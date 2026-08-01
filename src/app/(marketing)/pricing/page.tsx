import Link from "next/link";
import { Check } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring Lumora's AI suggestions.",
    features: [
      "Unlimited projects",
      "Tier 0 AI suggestions (always free)",
      "5 exports/month",
      "Community support",
    ],
    cta: "Get started free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Creator",
    price: "$19",
    description: "For solo creators who want full AI generation power.",
    features: [
      "Everything in Free",
      "200 generation credits/month",
      "Priority provider routing",
      "Asset provenance manifests",
      "Unlimited exports",
    ],
    cta: "Start creating",
    href: "/signup",
    featured: true,
  },
  {
    name: "Studio",
    price: "$79",
    description: "For teams and professional workflows.",
    features: [
      "Everything in Creator",
      "1,000 credits/month",
      "Team workspaces",
      "API access",
      "Priority support",
      "Custom provider config",
    ],
    cta: "Contact sales",
    href: "/contact",
    featured: false,
  },
];

const FAQ_ITEMS = [
  {
    question: "What are generation credits?",
    answer:
      "Credits are consumed when you use Tier 1 AI generation — voiceover, music, or image gen. Tier 0 features (captions, transitions, cut suggestions) are always free and never use credits.",
  },
  {
    question: "What happens when I run out of credits?",
    answer:
      "You can still use all Tier 0 features. Tier 1 generation will pause until your credits reset at the start of your billing cycle, or you upgrade your plan.",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Yes — the Free plan gives you full access to all Tier 0 AI features and 5 monthly exports with no credit card required.",
  },
  {
    question: "Which AI providers does Lumora use?",
    answer:
      "Lumora's agentic loop routes generation across GMI Cloud, ElevenLabs, Runway, Stability Audio, and Luma — automatically selecting the best result per quality evaluation.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No lock-in, no cancellation fees. Cancel from your Settings page at any time and you keep access until the end of your billing period.",
  },
];

export default function PricingPage() {
  return (
    <main>
      <section className="px-16 pb-16 pt-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Simple, credit-based pricing
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-muted)]">
          Tier 0 suggestions (captions, cuts, transitions) are always free.
          Tier 1 generation (voiceover, music, images) uses credits.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 px-16 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl bg-[var(--color-surface-1)] p-8",
              plan.featured
                ? "border-2 border-[#FF6A1A]"
                : "border border-[var(--color-border)]"
            )}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF6A1A] px-4 py-1 text-xs font-medium text-white">
                Most popular
              </span>
            )}
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-lg text-[var(--color-text-muted)]">
                /month
              </span>
            </div>
            <p className="mt-3 text-[var(--color-text-muted)]">
              {plan.description}
            </p>
            <div className="mt-6 border-t border-[var(--color-border)]" />
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      plan.featured
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)]"
                    )}
                    strokeWidth={2.5}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      plan.featured
                        ? "text-white"
                        : "text-[var(--color-text-muted)]"
                    )}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={plan.featured ? "default" : "outline"}
              size="lg"
              className="mt-8 w-full"
            >
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-16">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-white">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
