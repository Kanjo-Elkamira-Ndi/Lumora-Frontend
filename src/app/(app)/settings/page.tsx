"use client";

import { useState } from "react";
import {
  CreditCard,
  HardDrive,
  MonitorPlay,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils/cn";
import { toastSuccess } from "@/lib/utils/toast";

const NAV_ITEMS = [
  { id: "general", label: "General", icon: UserRound },
  { id: "members", label: "Members", icon: Users },
];

const USAGE = [
  { id: "storage", label: "Storage", used: 6.2, total: 100, unit: "GB", icon: HardDrive },
  { id: "minutes", label: "AI minutes", used: 12.4, total: 100, unit: "k", icon: MonitorPlay },
  { id: "projects", label: "Projects", used: 3, total: 10, unit: "", icon: CreditCard },
];

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function initialsFor(email?: string) {
  if (!email) return "YO";
  const head = email.split("@")[0] ?? "";
  return (head.slice(0, 2) || email.slice(0, 2)).toUpperCase();
}

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [workspaceName, setWorkspaceName] = useState("Lumora Studio");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "you@lumora.studio";
  const initials = initialsFor(user?.email);

  return (
    <div className="px-8 pb-10 pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Manage your account, workspace, and billing.
        </p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-8">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-[var(--color-surface-2)] font-medium text-white"
                    : "text-[var(--color-text-muted)] hover:text-white"
                )}
              >
                <Icon size={16} className={active ? "text-[var(--color-primary)]" : ""} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === "members" ? (
          <div className="max-w-[640px]">
            <SectionCard
              title="Members"
              description="Invite teammates to this workspace."
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                  <span className="text-xs font-medium text-white">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{email}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Owner</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    /* todo: backend has no invite endpoint yet */
                  }}
                >
                  Invite
                </Button>
              </div>
            </SectionCard>
          </div>
        ) : (
          <div className="flex max-w-[640px] flex-col gap-6">
            <SectionCard
              title="Profile"
              description="Your account information."
            >
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-b from-[#FF6A1A] to-[#C14E0E]">
                  <span className="text-lg font-semibold text-white">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{email}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Pro workspace member
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* todo: no backend endpoint to update user profile */
                  }}
                >
                  Edit
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Workspace"
              description="Name, plan, and seat limits."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    aria-label="Workspace name"
                    className="max-w-xs bg-[var(--color-surface-0)]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toastSuccess("Workspace renamed")}
                  >
                    Save
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Pro plan</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      $39 / mo · annual billing
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* todo: no backend endpoint to change plan */
                    }}
                  >
                    Change plan
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Seats
                  </p>
                  <p className="text-sm text-white">3 of 5 used</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Billing"
              description="Usage and invoicing."
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                  {USAGE.map((u) => {
                    const Icon = u.icon;
                    const pct = Math.round((u.used / u.total) * 100);
                    return (
                      <div key={u.id}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                            <Icon size={14} className="text-[var(--color-text-muted)]" />
                            {u.label}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {u.used} {u.unit} / {u.total} {u.unit}
                          </span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Next invoice</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Aug 15, 2026 · $39.00
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] px-2 py-0.5 text-xs text-[var(--color-success)]">
                    Upcoming
                  </span>
                </div>
              </div>
            </SectionCard>

            <section className="rounded-xl border border-[rgba(239,68,68,0.3)] bg-[var(--color-surface-1)] p-6">
              <h2 className="text-base font-semibold text-[var(--color-error)]">
                Danger Zone
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Permanently delete this workspace and all its projects.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5 border-[rgba(239,68,68,0.4)] text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--color-error)]"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 size={14} />
                Delete workspace
              </Button>
            </section>
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="gap-4 p-6">
          <DialogTitle>Delete workspace?</DialogTitle>
          <DialogDescription>
            This permanently deletes Lumora Studio and all associated projects.
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="ghost"
              size="default"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="default"
              className="bg-[var(--color-error)] hover:bg-[var(--color-error)]"
              onClick={() => {
                setConfirmOpen(false);
                toastSuccess("Workspace deleted");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
