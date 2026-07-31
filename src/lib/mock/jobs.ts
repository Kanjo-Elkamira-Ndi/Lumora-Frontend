import type { Job } from '@/types'

export const MOCK_JOB_RUNNING: Job = {
  id: 'job_running_01',
  projectId: 'proj_01',
  prompt: 'Add a cinematic voiceover introducing the product',
  tier: 'tier1',
  status: 'running',
  percent: 45,
  message: 'Rendering voiceover audio — 45%',
  createdAt: '2026-07-30T09:30:00Z',
  updatedAt: '2026-07-30T09:30:42Z',
}

export const MOCK_JOB_COMPLETE: Job = {
  id: 'job_complete_01',
  projectId: 'proj_01',
  prompt: 'Generate a lower-third for the host name',
  tier: 'tier0',
  status: 'complete',
  percent: 100,
  layerId: 'lyr_t1',
  createdAt: '2026-07-30T09:15:00Z',
  updatedAt: '2026-07-30T09:15:03Z',
}

export const MOCK_JOB_ESCALATED: Job = {
  id: 'job_escalated_01',
  projectId: 'proj_01',
  prompt: 'Generate a seamless transition between scenes',
  tier: 'agentic',
  status: 'escalated',
  percent: 100,
  reason: 'Could not produce a transition that passes all quality checks after 3 attempts.',
  bestAttemptAssetId: 'ast_02',
  createdAt: '2026-07-30T08:50:00Z',
  updatedAt: '2026-07-30T08:53:12Z',
  attempts: [
    {
      attempt: 1,
      maxAttempts: 3,
      status: 'failed',
      checks: [
        { id: 'chk_1', label: 'Duration matches selection', passed: true },
        { id: 'chk_2', label: 'No visible artifacts', passed: false },
        { id: 'chk_3', label: 'Audio sync intact', passed: true },
      ],
      failureReason: 'Visible flicker in the first 500ms.',
    },
    {
      attempt: 2,
      maxAttempts: 3,
      status: 'failed',
      checks: [
        { id: 'chk_1', label: 'Duration matches selection', passed: true },
        { id: 'chk_2', label: 'No visible artifacts', passed: false },
        { id: 'chk_3', label: 'Audio sync intact', passed: true },
      ],
      failureReason: 'Color mismatch at the cut point.',
    },
    {
      attempt: 3,
      maxAttempts: 3,
      status: 'failed',
      checks: [
        { id: 'chk_1', label: 'Duration matches selection', passed: true },
        { id: 'chk_2', label: 'No visible artifacts', passed: false },
        { id: 'chk_3', label: 'Audio sync intact', passed: true },
      ],
      failureReason: 'Transition loops rather than settles.',
    },
  ],
}
