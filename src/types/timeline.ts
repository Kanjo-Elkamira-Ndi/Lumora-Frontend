export type LayerType = 'video' | 'audio' | 'text' | 'effect'

export type LayerSource = 'manual' | 'llm_suggested' | 'genblaze_generated'

export type Layer = {
  id: string
  type: LayerType
  label: string
  source: LayerSource
  startMs: number
  durationMs: number
  assetId?: string
  props?: Record<string, string | number | boolean>
}

export type Track = {
  id: string
  type: LayerType
  name: string
  layers: Layer[]
}

export type Timeline = {
  id: string
  projectId: string
  durationMs: number
  tracks: Track[]
}
