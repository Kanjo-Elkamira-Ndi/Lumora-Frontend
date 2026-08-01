"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { EditorShell } from "@/components/editor/editorShell";
import { useEditorStore } from "@/stores/editorStore";

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const setProject = useEditorStore((s) => s.setProject);

  useEffect(() => {
    setProject(params.projectId);
  }, [params.projectId, setProject]);

  return <EditorShell />;
}
