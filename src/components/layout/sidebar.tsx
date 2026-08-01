"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Library, Settings, User } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Projects", href: "/dashboard", icon: FolderOpen },
  { label: "Asset Library", href: "/assets", icon: Library },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[240px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] md:flex">
      <div className="border-b border-[var(--color-border)] p-6 pb-4">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          Lumora
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "bg-[var(--color-surface-2)] font-medium text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[var(--color-primary)]" />
              )}
              <Icon
                className={cn(
                  "shrink-0",
                  item.label === "Projects" ? "size-[15px]" : "size-4",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
            <User className="size-4 text-[var(--color-text-muted)]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
              Kanjo Ndi
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              kanjoelkamira@gmail.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
