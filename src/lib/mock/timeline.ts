import type { Timeline } from '@/types'

export const MOCK_TIMELINE: Timeline = {
  id: 'tl_01',
  projectId: 'proj_01',
  durationMs: 30000,
  tracks: [
    {
      id: 'trk_video',
      type: 'video',
      name: 'Video',
      layers: [
        {
          id: 'lyr_v1',
          type: 'video',
          label: 'Hero Interview B-Roll',
          source: 'manual',
          startMs: 0,
          durationMs: 12000,
          assetId: 'ast_01',
        },
        {
          id: 'lyr_v2',
          type: 'video',
          label: 'City Night Timelapse',
          source: 'genblaze_generated',
          startMs: 12000,
          durationMs: 10000,
          assetId: 'ast_02',
        },
        {
          id: 'lyr_v3',
          type: 'video',
          label: 'Studio Logo Animation',
          source: 'manual',
          startMs: 22000,
          durationMs: 8000,
          assetId: 'ast_03',
        },
      ],
    },
    {
      id: 'trk_audio',
      type: 'audio',
      name: 'Audio',
      layers: [
        {
          id: 'lyr_a1',
          type: 'audio',
          label: 'Ambient Chill Beat',
          source: 'manual',
          startMs: 0,
          durationMs: 30000,
          assetId: 'ast_04',
        },
        {
          id: 'lyr_a2',
          type: 'audio',
          label: 'Voiceover — Intro Script',
          source: 'genblaze_generated',
          startMs: 0,
          durationMs: 12000,
          assetId: 'ast_05',
        },
      ],
    },
    {
      id: 'trk_text',
      type: 'text',
      name: 'Text',
      layers: [
        {
          id: 'lyr_t1',
          type: 'text',
          label: 'Lower Third — Name',
          source: 'manual',
          startMs: 2000,
          durationMs: 8000,
          props: {
            content: 'Alex Rivera',
            font: 'Inter',
            size: 28,
          },
        },
        {
          id: 'lyr_t2',
          type: 'text',
          label: 'Title Card — Product Launch',
          source: 'genblaze_generated',
          startMs: 12000,
          durationMs: 5000,
          props: {
            content: 'The Future Is Here',
            font: 'Inter',
            size: 48,
          },
        },
        {
          id: 'lyr_t3',
          type: 'text',
          label: 'End Screen — Call to Action',
          source: 'llm_suggested',
          startMs: 22000,
          durationMs: 8000,
          props: {
            content: 'Learn more at lumora.app',
            font: 'Inter',
            size: 36,
          },
        },
      ],
    },
    {
      id: 'trk_effects',
      type: 'effect',
      name: 'Effects',
      layers: [
        {
          id: 'lyr_e1',
          type: 'effect',
          label: 'Blur Transition',
          source: 'manual',
          startMs: 11000,
          durationMs: 1000,
          props: {
            amount: 40,
          },
        },
        {
          id: 'lyr_e2',
          type: 'effect',
          label: 'Warm Grade',
          source: 'genblaze_generated',
          startMs: 0,
          durationMs: 30000,
          props: {
            temperature: 1.2,
          },
        },
      ],
    },
  ],
}
