"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  email: string;
  message: string;
};

const INPUT_CLASSES =
  "h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors duration-150 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,106,26,0.25)]";

const TEXTAREA_CLASSES =
  "min-h-32 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors duration-150 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,106,26,0.25)]";

const ERROR_CLASSES =
  "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[rgba(239,68,68,0.25)]";

export function ContactForm() {
  const [values, setValues] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof FormState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_PATTERN.test(values.email.trim()))
      next.email = "Please enter a valid email address.";
    if (!values.message.trim())
      next.message = "Please tell us how we can help.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/10">
          <Check
            aria-hidden
            className="size-7 text-[var(--color-success)]"
            strokeWidth={2.5}
          />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-white">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
          Thanks for reaching out — we&apos;ll get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-8"
    >
      <div>
        <label
          htmlFor="contact-name"
          className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          Full name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={cn(INPUT_CLASSES, errors.name && ERROR_CLASSES)}
        />
        {errors.name && (
          <p
            id="contact-name-error"
            role="alert"
            className="mt-1.5 text-sm text-[var(--color-error)]"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-email"
          className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ada@studio.com"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={cn(INPUT_CLASSES, errors.email && ERROR_CLASSES)}
        />
        {errors.email && (
          <p
            id="contact-email-error"
            role="alert"
            className="mt-1.5 text-sm text-[var(--color-error)]"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-message"
          className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          How can we help?
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us about your project, your team, or what you're trying to build…"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={cn(TEXTAREA_CLASSES, errors.message && ERROR_CLASSES)}
        />
        {errors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-1.5 text-sm text-[var(--color-error)]"
          >
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-8 w-full">
        <Send className="size-4" />
        Send message
      </Button>
    </form>
  );
}
