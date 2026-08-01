import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/appShell";

// TODO: redirect to /login if not authenticated.

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
