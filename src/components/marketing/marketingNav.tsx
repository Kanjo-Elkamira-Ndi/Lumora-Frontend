import Link from "next/link";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it works", href: "/#how-it-works" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-[var(--color-border)] bg-[#1D1D20]">
      <div className="mx-auto flex h-full w-full items-center px-10">
        <div className="shrink-0">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white"
          >
            Lumora
          </Link>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-12 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-6">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
