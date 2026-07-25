# Workflows — Lumora Frontend

## 1. Create a New Project

**Entry point:** Dashboard → "New Project" button

```
User clicks "New Project"
  → newProjectButton.tsx calls createProject() from lib/api/projects.ts
  → POST /api/projects/ { name: "Untitled Project" }
  → On success: router.push('/editor/{newProjectId}')
  → Editor page loads, fetches timeline via useTimeline(projectId)
```

**State touched:** `editorStore.projectId` set on navigation.

---

## 2. Load the Editor

**Entry point:** `/editor/[projectId]`

```
page.tsx mounts
  → useTimeline(projectId) fires
  → GET /api/projects/{id}/timeline/
  → timelineStore populated with tracks + layers
  → EditorShell renders with timeline data
  → PreviewPanel renders with first video asset (if any)
  → AiPromptBar ready for input
```

**Loading state:** `loading.tsx` shows a skeleton editor shell while data fetches.

---

## 3. Submit an AI Prompt (full flow)

**Entry point:** PromptBar → user types prompt → clicks "Generate"

```
User submits prompt
  → promptBar.tsx reads selectedTier from editorStore
  → Calls createJob() from lib/api/jobs.ts
  → POST /api/jobs/ { projectId, prompt, tier: 1, jobType: "voiceover" }
  → jobStore.addJob(newJob)

  → useJob(jobId) activates
  → wsClient.connect(jobId) opens WebSocket to /ws/jobs/{jobId}/

  → JobStatusOverlay opens (if Tier 1 or Agentic)
    → shows GenerationProgress (progress bar + ETA from WS messages)

  → WS messages arrive:
      { type: "progress", percent: 40, message: "Generating audio..." }
      → jobStore.updateJob(jobId, { percent: 40 })

  → If Agentic tier:
      { type: "agentic_attempt", attempt: 1, checks: [...], passed: false }
      → AgenticRunCard updates with attempt 1 result
      { type: "agentic_attempt", attempt: 2, checks: [...], passed: true }
      → AgenticRunCard shows success

  → Final WS message:
      { type: "complete", layerId: "abc", trackId: "xyz", assetId: "def" }
      → wsClient closes
      → jobStore.markTerminal(jobId)
      → timelineStore.addLayer(layer)   ← new layer appears on timeline
      → JobStatusOverlay closes
      → Layer highlighted/selected on timeline
```

---

## 4. Manual Layer Edit

**Entry point:** User clicks a LayerChip on the timeline

```
User clicks LayerChip
  → editorStore.selectedLayerId = layerId
  → LayerPropertiesPanel re-renders with that layer's params
  → User edits a param (e.g. volume from 0.8 to 0.5)
  → Form onChange → timelineStore.updateLayerOptimistic(layerId, params)
    (instant UI update)
  → Debounced (500ms): PATCH /api/projects/{id}/timeline/ with updated layer
  → On success: no-op (store already updated)
  → On error: timelineStore.revertLayer(layerId) + toast error
```

---

## 5. Drag a Layer on the Timeline

**Entry point:** User drags a LayerChip horizontally

```
Drag starts
  → useLayerDrag activates, sets editorStore.draggingLayerId
  → CSS: pointer-events: none on all other layers during drag

Drag in progress
  → transform: translateX() applied in real time (no store update)
  → Time position calculated from pixel offset + timeline zoom level

Drag ends
  → timelineStore.updateLayerOptimistic(layerId, { startTime: newTime })
  → PATCH /api/projects/{id}/timeline/ (same debounced save as above)
  → editorStore.draggingLayerId = null
```

---

## 6. Export

**Entry point:** TopBar → "Export" button

```
User clicks Export
  → ExportModal opens
  → User selects format (MP4), resolution, quality
  → Clicks "Export"
  → createExport(projectId, options) → POST /api/exports/
  → useExport hook polls GET /api/exports/{exportId}/ every 2s
  → ExportModal shows progress bar
  → On complete: download URL displayed + direct download triggered
```

---

## 7. Escalated Agentic Job

**Entry point:** Agentic job that fails all 3 attempts

```
WS message arrives:
  { type: "escalated", bestAttemptAssetId: "xyz", reason: "ASR confidence < 0.7" }

→ jobStore.markEscalated(jobId)
→ AgenticRunCard shows "Needs review" state
→ User sees best attempt with option to:
    A) Accept it anyway → calls POST /api/jobs/{id}/accept-escalation/
    B) Dismiss and reprompt → closes overlay, prompt bar focused
```

---

## 8. View Asset Provenance

**Entry point:** Right-click a layer → "View provenance" or asset library context menu

```
User triggers provenance view
  → GET /api/assets/{assetId}/manifest/
  → AssetManifestDrawer opens (slide-in from right)
  → Shows: prompt used, model/provider, attempt number, timestamp, sha256, b2Key
```

---

## WebSocket Message Schema

All WS messages from `/ws/jobs/{id}/` follow this shape:

```ts
type WsMessage =
  | { type: 'progress';        percent: number; message: string }
  | { type: 'agentic_attempt'; attempt: number; checks: EvalCheck[]; passed: boolean; failureReason?: string }
  | { type: 'complete';        layerId: string; trackId: string; assetId: string }
  | { type: 'escalated';       bestAttemptAssetId: string; reason: string }
  | { type: 'error';           message: string }

type EvalCheck = {
  name: string       // e.g. "duration_check", "asr_roundtrip", "silence_clipping"
  passed: boolean
  detail?: string
}
```
