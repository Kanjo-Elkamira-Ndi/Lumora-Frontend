export type JobTier = 'tier0' | 'tier1' | 'agentic'

export type JobStatus = 'idle' | 'running' | 'complete' | 'escalated' | 'error'

export type EvalCheck = {
  id: string
  label: string
  passed: boolean
}

export type AgenticAttempt = {
  attempt: number
  maxAttempts: number
  status: 'running' | 'passed' | 'failed'
  checks: EvalCheck[]
  failureReason?: string
}

type JobBase = {
  id: string
  projectId: string
  prompt: string
  tier: JobTier
  createdAt: string
  updatedAt: string
}

export type Job = JobBase &
  (
    | { status: 'idle' }
    | { status: 'running'; percent: number; message: string }
    | { status: 'complete'; percent: 100; layerId: string }
    | {
        status: 'escalated'
        percent: number
        reason: string
        bestAttemptAssetId: string
        attempts: AgenticAttempt[]
      }
    | { status: 'error'; message: string }
  )

export type WsMessage =
  | { type: 'job.update'; job: Job }
  | { type: 'job.complete'; job: Job }
  | { type: 'job.escalated'; job: Job }
  | { type: 'job.error'; job: Job }
