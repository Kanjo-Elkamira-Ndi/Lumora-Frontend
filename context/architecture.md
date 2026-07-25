# Architecture — Lumora Frontend

## High-Level Data Flow

```
User action (prompt / manual edit)
        ↓
React component (editor/ai/ or editor/timeline/)
        ↓
Custom hook (usePrompt / useTimeline / useJob)
        ↓
Zustand store (update optimistic state)
        ↓
API client (lib/api/)  ←→  FastAPI backend
        ↓
TanStack Query (cache invalidation / refetch)
        ↓
WebSocket client (lib/ws/)  ←→  /ws/jobs/{id}/
        ↓
Store update → React re-render
```

---

## App Router Page Structure

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx              # Shell with sidebar + topbar
    dashboard/page.tsx      # Project list
    editor/[projectId]/
      page.tsx              # Editor shell
      loading.tsx
      error.tsx
  api/                      # Next.js route handlers (proxy layer only)
    [...path]/route.ts      # Forwards to FastAPI, attaches auth header
```

The `api/` route handler is a thin proxy — it attaches the JWT from the session cookie and forwards to the FastAPI backend. No business logic lives here.

---

## Component Architecture

### Editor Shell (`components/editor/`)

The editor is the core of the app. It has four panels:

```
┌──────────────────────────────────────────────────────────┐
│  TopBar (project name, export button, job status badge)  │
├──────────┬───────────────────────────┬───────────────────┤
│          │                           │                   │
│  Asset   │      PreviewPanel         │  LayerProperties  │
│  Library │      (VideoPlayer)        │  Panel            │
│  Panel   │                           │                   │
│          ├───────────────────────────┤                   │
│          │      TimelinePanel        │                   │
│          │  (tracks + layers)        │                   │
├──────────┴───────────────────────────┴───────────────────┤
│              AI Prompt Bar                               │
└──────────────────────────────────────────────────────────┘
```

Components:

- `EditorShell` — layout container, manages panel resize
- `PreviewPanel` — wraps Video.js, synced to timeline playhead position
- `TimelinePanel` — canvas-based or DOM-based track/layer renderer
  - `TrackRow` — one row per track (video / audio / text / effects)
  - `LayerChip` — draggable layer block on the track
  - `Playhead` — the current-time indicator
- `AssetLibraryPanel` — searchable asset grid, drag-to-timeline support
- `LayerPropertiesPanel` — form controls for the selected layer's params
- `AiPromptBar` — text input + submit, shows tier badge and generation state
- `JobStatusOverlay` — modal/drawer for Tier 1 + agentic job progress

### AI Components (`components/ai/`)

- `PromptBar` — the main prompt input
- `GenerationProgress` — progress bar with tier label and ETA
- `AgenticRunCard` — shows attempt N of 3, evaluation result, retry/escalate state
- `TierBadge` — small pill showing Tier 0 / Tier 1 / Agentic

---

## State Architecture

### Zustand Stores (`stores/`)

| Store | Owns |
|---|---|
| `useEditorStore` | Active project ID, selected layer ID, playhead position, panel sizes |
| `useTimelineStore` | Timeline data (tracks, layers) — mirrors backend timeline state |
| `useJobStore` | All active and recent jobs, their status and tier |
| `useAssetStore` | Asset library cache, search query, selected asset |
| `useAuthStore` | Current user, JWT token, session expiry |

### TanStack Query (`hooks/`)

TanStack Query handles all server state. Zustand handles all client/UI state. They do not overlap.

- `useTimeline(projectId)` — fetches and caches timeline; mutations call `PATCH /api/projects/{id}/timeline/`
- `useJob(jobId)` — polls job status; superseded by WebSocket when WS is active
- `useAssets(query, tags)` — paginated asset search
- `useExport(projectId)` — triggers render, polls for completion

### WebSocket (`lib/ws/`)

One WebSocket connection per active job. Opens when a Tier 1 or agentic job is created, closes when the job reaches terminal state (stored, escalated, failed).

```
wsClient.connect(jobId)
  → on message: jobStore.updateJob(jobId, payload)
  → on close: jobStore.markTerminal(jobId)
```

---

## Module Boundaries

| Module | Can import from | Cannot import from |
|---|---|---|
| `components/` | `hooks/`, `stores/`, `lib/`, `types/` | Other `components/` subtrees directly (use composition) |
| `hooks/` | `lib/`, `stores/`, `types/` | `components/` |
| `stores/` | `types/`, `lib/utils/` | `components/`, `hooks/` |
| `lib/api/` | `types/` | Everything else |
| `lib/ws/` | `types/` | Everything else |
| `app/` pages | `components/`, `hooks/`, `stores/` | `lib/` directly (go through hooks) |

---

## API Client (`lib/api/`)

A typed fetch wrapper. No axios. Each resource has its own file:

```
lib/api/
  client.ts         # base fetch with auth header injection and error handling
  projects.ts       # createProject, getTimeline, patchTimeline
  jobs.ts           # createJob, getJob
  assets.ts         # searchAssets, getManifest
  exports.ts        # createExport
```

All functions return typed responses matching `types/`. Errors throw `ApiError` with `status` and `message`.

---

## Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Dashboard | SSR | Project list needs to be fresh on load |
| Editor | CSR (client component) | Heavy interactivity, WebSocket, canvas |
| Auth pages | Static | No data dependency |
| Asset manifest | SSR | SEO-irrelevant but keeps it simple |
