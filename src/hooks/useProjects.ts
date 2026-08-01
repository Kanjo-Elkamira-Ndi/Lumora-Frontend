"use client";

import { useMemo } from "react";

import { MOCK_PROJECTS } from "@/lib/mock/projects";

export function useProjects() {
  return useMemo(() => MOCK_PROJECTS, []);
}
