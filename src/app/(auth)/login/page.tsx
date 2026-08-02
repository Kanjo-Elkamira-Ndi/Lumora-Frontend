"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, User } from "lucide-react";

import { AuthLeftPanel } from "@/components/auth/authLeftPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe, login } from "@/lib/api/auth";
import { toastError } from "@/lib/utils/toast";
import { useAuthStore } from "@/stores/authStore";

const TESTIMONIAL = (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[#26262A] p-6">
    <p className="leading-relaxed text-[var(--color-text-secondary)]">
      &ldquo;Lumora changed how I work. The AI suggestions feel like having an
      editor on-call. I&apos;ve cut my post-production time in half.&rdquo;
    </p>
    <div className="mt-4 flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#303036]">
        <User aria-hidden className="size-4 text-[var(--color-text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">Alex Chen</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Lead Video Editor
        </p>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toastError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      const me = await getMe();
      setUser({ id: me.id, email: me.email, name: "" });
      router.push("/dashboard");
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Unable to log in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex h-screen w-full">
      <div className="hidden h-screen w-1/2 md:block">
        <AuthLeftPanel
          tagline="Edit with AI. Stay in control."
          bottomSlot={TESTIMONIAL}
        />
      </div>

      <div className="flex h-screen w-full items-center justify-center bg-[var(--color-surface-1)] px-6 md:w-1/2">
        <div className="w-full max-w-[400px]">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Log in to your Lumora account
          </p>

          <button
            type="button"
            onClick={() => {
              /* todo: no Google OAuth provider configured on the backend */
            }}
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

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin();
            }}
          >
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-sm text-[var(--color-text-muted)]"
              >
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-sm text-[var(--color-text-muted)]"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="#"
                  className="text-sm text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-primary)]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>

          <Button
            onClick={() => void handleLogin()}
            size="lg"
            className="mt-6 h-11 w-full"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Log in"}
          </Button>

          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--color-primary)] transition-opacity duration-150 hover:opacity-80"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
