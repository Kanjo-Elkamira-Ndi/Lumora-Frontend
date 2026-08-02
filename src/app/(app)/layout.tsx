import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/appShell";
import { SessionCheck } from "@/components/layout/sessionCheck";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SessionCheck>{children}</SessionCheck>
    </AppShell>
  );
}
