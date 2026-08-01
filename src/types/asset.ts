export type AssetKind = 'video' | 'audio' | 'image'

export type AssetSource = 'upload' | 'ai-generated'

export type Asset = {
  id: string
  name: string
  kind: AssetKind
  url: string
  thumbnailUrl?: string
  durationMs?: number
  mimeType?: string
  sizeBytes?: number
  createdAt?: string
  source?: AssetSource
}
