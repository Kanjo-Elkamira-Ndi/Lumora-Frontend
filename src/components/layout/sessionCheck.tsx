"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/types/api";

export function SessionCheck({ children }: { children: ReactNode }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    getMe()
      .then((me) =>
        setUser({ id: me.id, email: me.email, name: "" })
      )
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          clearUser();
          router.replace("/login");
        }
      });
  }, [router, setUser, clearUser]);

  return <>{children}</>;
}
