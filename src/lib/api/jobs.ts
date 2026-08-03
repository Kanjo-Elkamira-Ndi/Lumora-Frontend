import { apiFetch } from "./client";

export type JobStatusDto = "pending" | "running" | "completed" | "failed";

export type JobDto = {
  id: string;
  projectId: string;
  tier: number;
  jobType: string;
  prompt: string;
  status: JobStatusDto;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
};

export type AiJobResultDto = {
  jobId: string;
  status: string;
};

export type JobWsMessage = {
  status: JobStatusDto;
  jobId: string;
  result?: Record<string, unknown>;
  error?: string;
};

export function getJob(jobId: string) {
  return apiFetch<JobDto>(`/jobs/${jobId}`);
}

export type Tier1Kind = "voiceover" | "music" | "image" | "video";

export type Tier0Kind = "caption" | "transition" | "cut_points" | "motion_spec";

export function createAgenticJob(
  projectId: string,
  payload: { script: string; targetDuration?: number }
) {
  return apiFetch<AiJobResultDto>(`/ai/agentic`, {
    method: "POST",
    body: { projectId, ...payload },
  });
}

export function createTier1Job(
  projectId: string,
  kind: Tier1Kind,
  payload: {
    script?: string;
    prompt?: string;
    voiceConfig?: Record<string, unknown>;
    duration?: number;
    size?: string;
  }
) {
  return apiFetch<AiJobResultDto>(`/ai/${kind}`, {
    method: "POST",
    body: { projectId, ...payload },
  });
}

export function createTier0Job(
  projectId: string,
  jobType: Tier0Kind,
  prompt: string
) {
  return apiFetch<JobDto>(`/jobs`, {
    method: "POST",
    body: { projectId, tier: 0, jobType, prompt },
  });
}

export async function waitForJob(
  jobId: string,
  timeoutMs = 120000
): Promise<JobDto> {
  const started = Date.now();
  for (;;) {
    const job = await getJob(jobId);
    if (job.status === "completed" || job.status === "failed") return job;
    if (Date.now() - started > timeoutMs) {
      throw new Error("Timed out waiting for the job");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

export function createRenderJob(projectId: string, outputFormat: "mp4" | "webm") {
  return apiFetch<JobDto>(`/jobs/render`, {
    method: "POST",
    body: { projectId, outputFormat },
  });
}

export function subscribeToJob(
  jobId: string,
  onMessage: (message: JobWsMessage) => void
): () => void {
  const base =
    process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
  const url = `${base}/ws/jobs/${jobId}`;
  let ws: WebSocket | null = null;
  let closed = false;
  let retry: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (closed) return;
    ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data as string) as JobWsMessage);
      } catch {
        // ignore malformed payloads
      }
    };
    ws.onclose = (event) => {
      if (closed) return;
      if (event.code === 4001) return;
      retry = setTimeout(connect, 2500);
    };
    ws.onerror = () => {
      ws?.close();
    };
  };

  connect();
  return () => {
    closed = true;
    if (retry) clearTimeout(retry);
    ws?.close();
  };
}
