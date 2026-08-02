# Lumora Frontend ↔ Backend Wiring Plan

FastAPI backend at `~/Projects/Lumora` (`:8000`) · Next.js frontend at `~/Projects/lumora-frontend` (`:3000`).

## Status

| Part | State |
|---|---|
| Part 0 — Backend changes | ✅ **Done** (implemented by backend agent, contract confirmed) |
| Part 1 — Foundation (env, proxy, client) | ✅ **Done** (curl-verified: auth, projects CRUD, refresh rotation via proxy) |
| Part 2 — Auth | ✅ **Done** (CDP-verified: signup → /dashboard, sidebar email, unauth redirect) |
| Part 3 — Projects / dashboard | ✅ **Done** (CDP-verified: dashboard lists real projects, create → /editor/{id}) |
| Part 4 — Editor / timeline | ✅ **Done** (CDP-verified: real project name, composite timeline, layer create/reconcile, persistence) |
| Part 5 — Assets | ✅ **Done** (CDP-verified: real GET /api/assets, derived names, add-to-timeline clip, global library) |
| Part 6 — AI generation + jobs + WS | ✅ **Done** (CDP-verified: real voiceover job → WS running → completed → Accept creates audio layer) |
| Part 7 — Export / render | ✅ **Done** (CDP-verified: real render job → running → complete/failed states; completed-path UI verified via simulated terminal transition because B2 is unconfigured) |
| Part 8 — Settings + polish | ✅ **Done** (CDP-verified: settings shows real user email via `/api/auth/me`-backed authStore; layer Properties edits → real `PATCH /api/tracks/{trackId}/layers/{id}` round-trip, `params.size` 28→44 persisted and reflected in UI; all `console.log("… — mock")` stubs replaced with real calls or documented `todo` comments) |
| Pass 9 — Real assets → B2 → playable preview | ✅ **Done** (CDP-verified: tracks created at project creation; upload through the UI persists to B2 with real `duration`; editor preview plays real media from a B2 presigned URL — `<video>` element, playhead synced via `timeupdate`, persists across reload; clip layers carry `assetId` + real duration) |

**Execution scope (confirmed):** Parts 1–8 + Pass 9 verified end-to-end against the running backend (see Verification). Plan complete.

## Confirmed backend contract (from backend agent work)

- **Composite timeline** — `GET /api/projects/{project_id}/timeline` returns the full nested tree in one request:
  ```
  { project, timeline,
    tracks: [{ id, timelineId, kind: "video"|"audio"|"text"|"effects",
               position, createdAt,
               layers: [{ id, trackId,
                          layerType: "clip"|"transition"|"audio"|"text"|"effect",
                          params: {}, source: "manual"|"ai"|"llm_suggested",
                          position, createdAt, updatedAt }] }] }
  ```
  Tracks and layers are each sorted by `position` ascending. `params` is free-form JSON whose keys depend on `layerType`. 404 if the project isn't owned by the user.
- **Render/export job** — `POST /api/jobs/render` with `{projectId, outputFormat: "mp4"|"webm"}` → `202` + job object (`tier: 2`, `jobType: "render"`, `status: "pending"`). When it runs: renders via ffmpeg → uploads to B2 under `renders/{projectId}/{jobId}.mp4` → persists an AssetRow (`source: "ai"`, so it appears in `GET /api/assets?projectId=...`) → job `status=completed` with `result.asset = {id, mimeType, source: "ai", duration, b2Key}`. Failures → `status=failed` + human-readable `error`.
- **Job notifications** — same channel for render and AI jobs. `ws://<host>/ws/jobs/{jobId}` messages:
  ```
  {"status": "running", "jobId": "..."}
  {"status": "completed", "jobId": "...", "result": {..., "asset": {...}}}
  {"status": "failed", "jobId": "...", "error": "..."}
  ```
  `GET /api/jobs/{job_id}` mirrors the same transitions (`pending → running → completed | failed`). **Payloads carry no `percent`** — progress UI must be status/indeterminate-driven.
- **Auth** — `POST /api/auth/register|login|refresh` → `{accessToken, refreshToken, tokenType}`; `GET /api/auth/me` → `{id, email, createdAt}` (no `name`). All other endpoints require `Authorization: Bearer <accessToken>`.
- **Error shapes** — two coexist: `{"detail": "..."}` (HTTPException) and `{"error": {"code", "message", "request_id"}}` (unhandled exceptions). Client must normalize both.

## Known limitations / design around

1. **AI tier1 jobs (voiceover/music/image) do NOT persist AssetRows** — only render does. Generated voiceover layers reference an `assetId` that won't be in the asset library. Fine for wiring now; flag for a later backend change.
2. **Clip timing ambiguity** — clip `params = {assetId, start, end}` are source trim points, not timeline position. Mapper uses best-effort (`startMs` from `params.startTime`, durations from asset/params, `0` fallback) and round-trips the full `params` blob so nothing is lost on writes.
3. **Redis/Celery required for job execution** — job creation works without it, but `apply_async` needs Redis; the app also logs "Failed to start Redis job subscriber" and falls back to local WS delivery. Relevant from Part 6 onward; Parts 1–3 don't touch jobs.

## Part 1 — Foundation

- `.env.local`: `API_URL=http://localhost:8000` (server-only), `NEXT_PUBLIC_WS_URL=ws://localhost:8000`. Committed `.env.example` documents both.
- `src/app/api/[...path]/route.ts` — catch-all proxy: reads `lumora_session` cookie, forwards to `${API_URL}${path}`, injects `Authorization: Bearer <token>` + `Content-Type`, supports streaming for multipart uploads, mirrors status/body back. Special-cases `/api/auth/login|register|refresh` to **set the httpOnly cookies** from the JSON response (`lumora_session` = accessToken, `lumora_refresh` = refreshToken).
- `src/lib/api/client.ts` — `apiFetch<T>(path, init)`: builds URL, adds JSON handling, parses both error shapes into `ApiError` (existing `src/types/api.ts`), 401 → silent refresh-and-retry-once.
- `src/lib/api/*.ts` — `auth.ts`, `projects.ts` (timeline/assets/ai/jobs added in later parts).

## Part 2 — Auth

- `src/app/(auth)/login/page.tsx` → controlled email/password → `POST /api/auth/login` (proxy sets cookie), then `GET /api/auth/me` → `authStore.setUser({id, email, name: ""})`.
- Signup → `POST /api/auth/register`, auto-login, redirect `/dashboard`.
- `src/proxy.ts` (middleware) — redirect unauthenticated users (no `lumora_session`) away from `/dashboard`, `/assets`, `/settings`, `/editor/*` to `/login`.
- Boot session check: `(app)/layout.tsx` calls `/api/auth/me`; on 401 → clear + redirect `/login`.

## Part 3 — Projects / dashboard

- `src/hooks/useProjects.ts` → `GET /api/projects`; map `{id, name, updatedAt}`; loading/error states.
- `src/components/dashboard/newProjectModal.tsx` → `POST /api/projects {name}` → `router.push(\`/editor/${project.id}\`)`.
- Project rename → `PATCH /api/projects/{id}`; delete → `DELETE`.

## Part 4 — Editor / timeline

- `src/app/editor/[projectId]/page.tsx` — replace `setProject(mock)` with a data load: call `GET /api/projects/{id}/timeline` (composite), then `useTimelineStore.setTimeline(mapped)`.
- `src/lib/api/mappers.ts` — the core conversion layer:
  - Track: `kind` (`video|audio|text|effects`) → frontend `type` (`effects`→`effect`); `position` keeps row order.
  - Layer: `layerType` (`clip|transition|audio|text|effect`) → frontend `type` (`clip`→`video`, `transition`→`effect`); **time fields pulled out of `params`** (`startTime`/`duration` → `startMs`/`durationMs`), `props = params` for round-trip; `source` normalized (`manual`→`manual`, `ai`→`genblaze_generated`, `llm_suggested`→`llm_suggested`); `label` derived from params (asset name / text / filterType).
- Persistence:
  - `timelineStore.addLayer` → `POST /api/tracks/{trackId}/layers` (optimistic insert, reconcile with server response).
  - `updateLayerOptimistic` → `PATCH /api/tracks/{trackId}/layers/{id}` with the type-specific `params` shape.
  - Delete layer → `DELETE`.
- Layer chip right-click provenance reads the real asset manifest (Part 5).
- Keep undo/redo + playhead as UI-only (no backend concept).

## Part 5 — Assets

- `src/stores/assetStore.ts` + `src/components/editor/assets/assetLibraryPanel.tsx` + `src/app/(app)/assets/page.tsx` → `GET /api/assets?projectId={activeProject}` (projectId = editor param, or last-opened project for the global page).
- `name` derived from `b2Key`/filename; `kind` derived from `mimeType`.
- Import (drag/upload) → `POST /api/assets/import` (multipart). Search + AI-generated filter → `q`/`tags` query params.
- Preview/thumbnail → `GET /api/assets/{id}/url` (presigned).
- Provenance manifest drawer → `GET /api/assets/{id}/manifest` → render `{runId, data}` in the existing locked-JSON block.

## Part 6 — AI generation + jobs + WebSocket

- `tier1Modal.tsx` (voiceover/music/image) → `POST /api/ai/{voiceover|music|image}` → `{jobId, status}` → open the progress drawer.
- `agenticProgressDrawer.tsx` — **drive from the real job**:
  - Connect `ws://${NEXT_PUBLIC_WS_URL}/ws/jobs/{jobId}`; map backend statuses (`pending→idle/running`, `running→running`, `completed→complete`, `failed→error`) onto the existing `WsMessage`/`Job` types; polling fallback `GET /api/jobs/{id}`.
  - Keep attempts/checks/escalation as **staged UI** (mock `MOCK_JOB_*`) until the agentic loop is routed.
  - On `completed`: `result.asset` → call layers API to **create the audio layer** (backend doesn't create it) → refresh timeline.
- `src/lib/api/jobs.ts` — `getJob`, and a `subscribeToJob(jobId, onMessage)` WS helper with auto-reconnect + auth-failure handling (close code 4001).

## Part 7 — Export / render

- `exportModal.tsx` → keep as the config picker (format/preset/scale are frontend concerns).
- On "Export 2.2 GB" → `POST /api/jobs/render {projectId, outputFormat: "mp4"}` → open `exportProgressCard.tsx`, subscribe to the job WS; indeterminate progress on `running`, done state + "View in Assets" on `completed` (rendered asset now in the library); cancel → job cancel (if backend supports) or UI-only dismiss.

## Part 8 — Settings + polish

- Profile section → real user from `authStore` (populated by `sessionCheck` via `GET /api/auth/me`): email + initials-derived avatar in Profile and Members tabs. Workspace/billing/danger-zone stay static (no backend) with `// todo:` comments.
- `LayerPropertiesPanel` → every edit calls `timelineStore.updateLayerOptimistic` → real `PATCH /api/tracks/{trackId}/layers/{id}` (start/duration → `startMs`/`durationMs`; opacity/playbackRate/volume/intensity/content/fontSize → `props`); control defaults read the persisted `props`; all inputs/sliders got `aria-label`s.
- "Open AI Assist" empty-state action now dispatches `lumora:open-ai-assist`, which `AssetLibraryPanel` listens for (switches to the AI Assist tab).
- All remaining `console.log("... — mock")` stubs replaced: undo/redo, timeline zoom, preview volume/fullscreen, Google SSO, asset menu, workspace invite/edit/change-plan, and the tier-0 suggestion cards (backend supports `POST /api/jobs {tier:0, jobType:"caption"|"transition"|"cut_points"|"motion_spec"}` — documented in the `todo` comments, apply-result flow out of scope).
- Typecheck clean; lint has only the pre-existing `@next/next/no-img-element` warning.

## Pass 9 — Real assets → B2 → playable preview

Scope (confirmed with user): uploaded files only (AI-generated asset persistence out of scope), single active clip at the playhead (no multi-track compositing), B2 credentials are valid.

- Backend `controllers/projects.py::createProject` now creates the four default tracks (`DEFAULT_TRACK_KINDS = ["video","audio","text","effects"]`) right after timeline creation, so `GET /api/projects/{id}/timeline` returns all four immediately (no frontend lazy-creation needed; the editor keeps its existing path as a safety fallback for legacy projects).
- Backend `core/assets/assets.py` gains `persistStorageMetadata(session, *, assetId, b2Key, sha256, duration)`; `assets/controllers/assets.py::importAsset` now uploads to B2, probes duration via `getMediaInfo`, persists metadata, and unlinks the temp file in `finally`. Same temp-file fix in `core/services/import_layer.py::importAndLayer`.
- Backend `core/services/composition.py::buildAssetRegistry` rewritten: scans composition layers for `assetId`s, loads real `AssetRow`s via `_loadAssetForRender`, downloads from B2 when `localPath` is absent (keeps the row `id`), and falls back to asset-less render.
- Backend `core/timeline/layers.py` now enriches `clip`/`audio` layer params with the asset's real `duration` (seconds) at create and update time, so a clip's duration survives a reload instead of coming back as 0.
- Frontend `PreviewPanel` (`src/components/editor/previewPanel.tsx`) rewritten as a real player: resolves the topmost video-track layer overlapping the playhead (`startMs ≤ t < startMs+durationMs`, audio fallback), fetches the presigned URL via `getAssetUrl`, renders `<video>`/`<audio>`, Play/Pause drives the media element, an rAF loop syncs the playhead from `timeupdate`-style polling, scrubbing seeks, and missing `assetId`/URL keep the placeholder + a toast. Volume + Fullscreen now control the real element.
  - Fixed two bugs found during verification: the rAF loop passed milliseconds into `setPlayheadPosition` (which stores seconds), teleporting the playhead out of the clip and unmounting the video; and `onLoadedMetadata` read `e.currentTarget.duration` inside a `setMedia` updater that runs lazily during the next render (React nulls `currentTarget` after the handler), crashing the editor with "Cannot read properties of null (reading 'duration')".
- Frontend `assetLibraryPanel.tsx` `handleImport` shows the real persisted `duration` (`0:03` for the 3s test clip) instead of the 10s fallback.
- CDP-verified end-to-end (`/tmp/opencode/verify-preview.mjs`): fresh project → 4 tracks immediately (API + DB); upload `test-upload.mp4` through the UI → DB `b2_key=uploads/{projectId}/{assetId}.mp4`, `duration=3`; add to timeline → chip shows real name/duration, layer persisted with `params.assetId`; Play → `<video>` src is a live `https://s3.us-east-005.backblazeb2.com/lumora-b2/...` presigned URL, `currentTime` 0.80s→1.99s, playhead 0.8s→2s; reload → preview still loads the real clip (3s) from B2.
- Backend changes live in `~/Projects/Lumora` (separate repo); frontend changes in this repo. Typecheck clean; lint only the pre-existing `no-img-element` warning.

## Verification

- Backend running (`uv run python main.py` on `:8000`; Redis/Celery optional until Part 6 — the app starts fine without it).
- Frontend `npm run dev` on `:3000`.
- Drive flows via CDP (existing pattern): register/login → dashboard lists projects → create project → editor load (empty-timeline state proves the composite timeline path) → add/import asset → generate voiceover → WS progress → layer appears → export job → manifest drawer.
- Typecheck + lint after each part.

## Sequencing

1. ✅ Part 0 (backend) — done
2. ✅ Parts 1 → 2 → 3 (foundation + auth + projects) — done & CDP-verified
3. ✅ Part 4 → 5 (editor, assets) — done & CDP-verified
4. ✅ Part 6 (AI + WS) — done & CDP-verified
5. ✅ Part 7 (export) — done & CDP-verified
6. ✅ Part 8 (polish) — done & CDP-verified
7. ✅ Pass 9 (real assets → B2 → playable preview) — done & CDP-verified

## Risks

- Frontend/backend layer-model mismatch is the biggest lift (Part 4 mapper).
- Jobs need Redis + a Celery worker to actually execute; until then, job endpoints can be created but not completed.
- AI tier1 assets not persisted (see Known limitations).
- Refresh-token rotation is untested.

## Decisions (from planning review)

- API access: Next.js proxy + httpOnly cookie (matches `context/security.md`).
- Timeline data: backend composite timeline endpoint (implemented).
- Agentic drawer: wire to real tier1 jobs now; keep attempts/checks/escalation mocked.
- Export: backend render job endpoint (implemented).
- Assets library: per-project scope, names derived from `b2Key`/filename.
