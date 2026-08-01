"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff, Globe } from "lucide-react";
import { toast } from "sonner";

import { AuthLeftPanel } from "@/components/auth/authLeftPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HIGHLIGHTS = [
  "Tier 0 AI suggestions — captions, cuts, transitions — always free",
  "Agentic generation with automatic multi-provider quality checks",
  "Full provenance manifest on every AI-generated asset",
];

function PasswordInput({
  id,
  label,
  autoComplete,
}: {
  id: string;
  label: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
        >
          {visible ? (
            <EyeOff aria-hidden className="size-4" />
          ) : (
            <Eye aria-hidden className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  function handleSignup() {
    console.log("Signup — mock");
    toast.success("Account created! Please log in.");
    router.push("/login");
  }

  const highlights = (
    <ul className="flex flex-col gap-4">
      {HIGHLIGHTS.map((highlight) => (
        <li key={highlight} className="flex items-start gap-3">
          <CheckCircle
            aria-hidden
            className="mt-0.5 size-5 flex-shrink-0 text-[var(--color-primary)]"
            strokeWidth={2}
          />
          <span className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {highlight}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="flex h-screen w-full">
      <div className="hidden h-screen w-1/2 md:block">
        <AuthLeftPanel
          tagline="Your AI editing studio, built around you."
          bottomSlot={highlights}
        />
      </div>

      <div className="flex h-screen w-full items-center justify-center bg-[var(--color-surface-1)] px-6 md:w-1/2">
        <div className="w-full max-w-[400px]">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Free to start. No credit card required.
          </p>

          <button
            type="button"
            onClick={() => console.log("Google SSO — mock")}
            className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-white transition-colors duration-150 hover:bg-[var(--color-surface-3)]"
          >
            <Globe
              aria-hidden
              className="size-5 text-[var(--color-text-muted)]"
            />
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-4">
            <hr className="flex-1 border-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">
              or continue with email
            </span>
            <hr className="flex-1 border-[var(--color-border)]" />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="signup-name"
                className="mb-1 block text-sm text-[var(--color-text-muted)]"
              >
                Full name
              </label>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1 block text-sm text-[var(--color-text-muted)]"
              >
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
              />
            </div>
            <PasswordInput
              id="signup-password"
              label="Password"
              autoComplete="new-password"
            />
            <PasswordInput
              id="signup-confirm-password"
              label="Confirm password"
              autoComplete="new-password"
            />
          </div>

          <Button
            onClick={handleSignup}
            size="lg"
            className="mt-6 h-11 w-full"
          >
            Create account
          </Button>

          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--color-primary)] transition-opacity duration-150 hover:opacity-80"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
