# Frontend Roadmap — Lumora

Deadline: **August 3, 2026**. Build in this exact order — each phase must be done before the next begins.

---

## Phase 0 — Project Bootstrap (Day 1)

Get the repo running with correct config before writing any feature code.

- [ ] `pnpm create next-app lumora-frontend --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] Install core deps: `zustand @tanstack/react-query lucide-react video.js`
- [ ] Install shadcn/ui: `pnpm dlx shadcn@latest init`
- [ ] Add shadcn components needed: `button input dialog drawer toast progress badge slider`
- [ ] Configure `tailwind.config.ts` with Lumora color tokens (see `ui-context.md`)
- [ ] Set up `src/styles/tokens.css` with all CSS custom properties
- [ ] Set up `app/globals.css` with shadcn dark theme overrides
- [ ] Add `<html className="dark">` to root layout
- [ ] Set up `tsconfig.json` path aliases (`@/*`)
- [ ] Set up `src/lib/utils/cn.ts`
- [ ] Set up environment variable files (`.env.example`, `.env.local`)
- [ ] Set up `app/api/[...path]/route.ts` proxy

**Acceptance:** `pnpm dev` starts, `pnpm build` succeeds, page loads dark background.

---

## Phase 1 — Auth (Day 1–2)

- [ ] `authStore.ts` — user, session state
- [ ] `lib/api/client.ts` — base fetch wrapper with error handling
- [ ] Login page (`app/(auth)/login/page.tsx`)
- [ ] Signup page (`app/(auth)/signup/page.tsx`)
- [ ] `middleware.ts` — redirect unauthenticated users to `/login`
- [ ] Auth form components (reuse shadcn Input, Button)
- [ ] Session cookie handling in proxy route

**Acceptance:** Can sign up, log in, be redirected on protected routes, and log out.

---

## Phase 2 — Dashboard (Day 2)

- [ ] `lib/api/projects.ts` — `createProject`, `listProjects`
- [ ] `hooks/useProjects.ts`
- [ ] Dashboard page (`app/(app)/dashboard/page.tsx`)
- [ ] `projectCard.tsx` — shows project name, thumbnail, last-edited date
- [ ] `projectGrid.tsx` — responsive grid of project cards
- [ ] `newProjectButton.tsx` — creates project and navigates to editor
- [ ] App shell layout (`layout.tsx`, `sidebar.tsx`, `topbar.tsx`)

**Acceptance:** Can see project list, create a project, navigate to editor.

---

## Phase 3 — Editor Shell (Day 2–3)

Build the layout and static structure first — no data yet.

- [ ] `editorShell.tsx` — four-panel layout (asset library / preview / properties / timeline)
- [ ] `previewPanel.tsx` + `videoPlayer.tsx` — Video.js wrapper, shows placeholder when no video
- [ ] `timelinePanel.tsx` — scroll container, empty track rows
- [ ] `trackRow.tsx` — one row per track type (video / audio / text / effects)
- [ ] `timeRuler.tsx` — time markings at top of timeline
- [ ] `playhead.tsx` — current time indicator
- [ ] `assetLibraryPanel.tsx` — empty panel with search bar
- [ ] `layerPropertiesPanel.tsx` — empty panel placeholder
- [ ] `topbar.tsx` in editor context — project name, export button

**Acceptance:** Editor page loads, four panels visible, layout is correct per Stitch design.

---

## Phase 4 — Timeline + Layer Data (Day 3–4)

Wire the timeline to real data.

- [ ] `types/timeline.ts` — Timeline, Track, Layer, LayerType types
- [ ] `lib/api/projects.ts` — `getTimeline`, `patchTimeline`
- [ ] `hooks/useTimeline.ts` — TanStack Query fetch + mutation
- [ ] `timelineStore.ts` — client mirror of timeline state
- [ ] `editorStore.ts` — selectedLayerId, playheadPosition, projectId
- [ ] `layerChip.tsx` — renders a layer on the track with correct width/offset
- [ ] Layer selection — click to select, properties panel updates
- [ ] `hooks/useLayerDrag.ts` — drag to reposition layers
- [ ] `layerPropertiesPanel.tsx` — populated with forms per layer type
- [ ] `audioLayerForm.tsx`, `videoLayerForm.tsx`, `textLayerForm.tsx`
- [ ] Debounced save on layer edit

**Acceptance:** Can load an existing timeline, see layers, select them, edit properties, drag to reposition, and changes persist.

---

## Phase 5 — Asset Library (Day 4)

- [ ] `types/asset.ts`
- [ ] `lib/api/assets.ts` — `searchAssets`, `getManifest`
- [ ] `hooks/useAssets.ts`
- [ ] `assetStore.ts`
- [ ] `assetCard.tsx` — thumbnail, name, duration
- [ ] `assetSearch.tsx` — search input with debounce
- [ ] Drag from asset library to timeline (creates a layer)
- [ ] Asset manifest drawer (`assetManifestDrawer.tsx`)

**Acceptance:** Can search assets, drag one to timeline, view its provenance.

---

## Phase 6 — AI Prompt Bar + Job Tracking (Day 4–5)

This is the core differentiator. Build it carefully.

- [ ] `types/job.ts` — Job, JobTier, JobStatus, AgenticRun, EvalCheck
- [ ] `lib/api/jobs.ts` — `createJob`, `getJob`
- [ ] `lib/ws/wsClient.ts` — connect, disconnect, reconnect on drop
- [ ] `lib/ws/jobEventHandler.ts` — maps WS messages to store updates
- [ ] `jobStore.ts`
- [ ] `hooks/useJob.ts` — polling + WS upgrade
- [ ] `promptBar.tsx` — input, tier selector, submit
- [ ] `tierBadge.tsx`
- [ ] `generationProgress.tsx` — progress bar with tier label and ETA
- [ ] `agenticRunCard.tsx` — attempt counter, eval checks, escalation state
- [ ] `jobStatusOverlay.tsx` — modal/drawer housing progress + agentic cards
- [ ] On job complete: new layer appears on timeline, selected automatically

**Acceptance:** Can type a prompt, submit it, see real-time progress, see the result layer appear on the timeline.

---

## Phase 7 — Export (Day 5–6)

- [ ] `lib/api/exports.ts`
- [ ] `hooks/useExport.ts`
- [ ] `exportModal.tsx` — format/resolution/quality pickers, progress, download link

**Acceptance:** Can trigger export, see progress, download the resulting video.

---

## Phase 8 — Polish + Demo Prep (Day 6–7)

- [ ] Empty states for all panels (no projects, no assets, no layers)
- [ ] Error boundaries on editor, dashboard
- [ ] Toast notifications for all success/error states
- [ ] Keyboard shortcuts: Space (play/pause), Delete (delete selected layer), Cmd+Z (undo)
- [ ] Loading skeletons for timeline and asset library
- [ ] Responsive check at 1280px, 1440px, 1920px
- [ ] Record demo walkthrough: new project → prompt → generation → timeline → export

**Acceptance:** End-to-end demo works cleanly in one take.

---

## What is NOT in scope for the hackathon

- Mobile layout
- Undo/redo history beyond basic layer deletion
- Real-time collaboration
- Billing / subscription UI
- Settings page (beyond basic account info)
- i18n / French language support
