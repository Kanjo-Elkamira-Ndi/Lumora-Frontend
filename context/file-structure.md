# File Structure — Lumora Frontend

All source code lives under `src/`. Naming convention: **camelCase** for all files and variables, except Next.js convention files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) and config files.

```
lumora-frontend/
├── context/                          # Agent context files (this directory)
├── public/
│   └── assets/                       # Static images, icons, fonts
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no shell layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (app)/                    # Authenticated route group
│   │   │   ├── layout.tsx            # Shell: sidebar + topbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── editor/
│   │   │       └── [projectId]/
│   │   │           ├── page.tsx      # Editor shell (client component)
│   │   │           ├── loading.tsx
│   │   │           └── error.tsx
│   │   ├── api/
│   │   │   └── [...path]/
│   │   │       └── route.ts          # Proxy to FastAPI backend
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   └── globals.css               # Design tokens + Tailwind base
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── editor/                   # Editor-specific components
│   │   │   ├── editorShell.tsx       # Root layout for the editor page
│   │   │   ├── preview/
│   │   │   │   ├── previewPanel.tsx  # Panel wrapper
│   │   │   │   └── videoPlayer.tsx   # Video.js wrapper
│   │   │   ├── timeline/
│   │   │   │   ├── timelinePanel.tsx # Panel wrapper + scroll container
│   │   │   │   ├── trackRow.tsx      # One track row (video/audio/text/effects)
│   │   │   │   ├── layerChip.tsx     # Draggable layer block
│   │   │   │   ├── playhead.tsx      # Current-time indicator
│   │   │   │   └── timeRuler.tsx     # Time markings at the top
│   │   │   ├── properties/
│   │   │   │   ├── layerPropertiesPanel.tsx
│   │   │   │   ├── audioLayerForm.tsx
│   │   │   │   ├── videoLayerForm.tsx
│   │   │   │   ├── textLayerForm.tsx
│   │   │   │   └── effectLayerForm.tsx
│   │   │   └── assets/
│   │   │       ├── assetLibraryPanel.tsx
│   │   │       ├── assetCard.tsx
│   │   │       └── assetSearch.tsx
│   │   │
│   │   ├── ai/                       # AI prompt + generation UI
│   │   │   ├── promptBar.tsx         # Main prompt input
│   │   │   ├── tierBadge.tsx         # Tier 0 / Tier 1 / Agentic pill
│   │   │   ├── generationProgress.tsx # Progress bar + ETA
│   │   │   ├── agenticRunCard.tsx    # Attempt N of 3 + eval result
│   │   │   └── jobStatusOverlay.tsx  # Modal/drawer for active jobs
│   │   │
│   │   ├── dashboard/
│   │   │   ├── projectCard.tsx
│   │   │   ├── projectGrid.tsx
│   │   │   └── newProjectButton.tsx
│   │   │
│   │   └── layout/
│   │       ├── appShell.tsx          # Sidebar + topbar container
│   │       ├── sidebar.tsx
│   │       ├── topbar.tsx
│   │       └── exportModal.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTimeline.ts            # TanStack Query: fetch + mutate timeline
│   │   ├── useJob.ts                 # TanStack Query: poll job + WS upgrade
│   │   ├── useAssets.ts              # TanStack Query: search assets
│   │   ├── useExport.ts              # TanStack Query: trigger + poll export
│   │   ├── usePlayhead.ts            # Playhead position sync with video player
│   │   └── useLayerDrag.ts           # Drag logic for timeline layers
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── editorStore.ts            # projectId, selectedLayerId, playheadPos, panel sizes
│   │   ├── timelineStore.ts          # Tracks + layers (client mirror of backend state)
│   │   ├── jobStore.ts               # Active jobs, status, tier, agentic run data
│   │   ├── assetStore.ts             # Asset library cache + search state
│   │   └── authStore.ts              # User, token, session
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Base fetch: auth header, error handling
│   │   │   ├── projects.ts           # createProject, getTimeline, patchTimeline
│   │   │   ├── jobs.ts               # createJob, getJob
│   │   │   ├── assets.ts             # searchAssets, getManifest
│   │   │   └── exports.ts            # createExport
│   │   ├── ws/
│   │   │   ├── wsClient.ts           # WebSocket connect/disconnect/reconnect
│   │   │   └── jobEventHandler.ts    # Maps WS messages → jobStore updates
│   │   └── utils/
│   │       ├── timeFormat.ts         # Frame-accurate time formatting
│   │       ├── assetHelpers.ts       # MIME type checks, duration formatting
│   │       └── cn.ts                 # clsx + tailwind-merge helper
│   │
│   ├── types/                        # TypeScript domain types
│   │   ├── asset.ts                  # Asset, AssetSource, AssetKind
│   │   ├── timeline.ts               # Timeline, Track, Layer, LayerType
│   │   ├── job.ts                    # Job, JobTier, JobStatus, AgenticRun
│   │   ├── project.ts                # Project
│   │   └── api.ts                    # ApiError, PaginatedResponse<T>
│   │
│   └── styles/
│       └── tokens.css                # CSS custom properties (design tokens)
│
├── .env.example
├── .eslintrc.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                   # shadcn/ui config
└── package.json
```

---

## Key Rules for File Placement

- **New UI component** → `src/components/{domain}/componentName.tsx`
- **New data hook** → `src/hooks/useResourceName.ts`
- **New store** → `src/stores/resourceStore.ts`
- **New API function** → `src/lib/api/resource.ts`
- **New type** → `src/types/domain.ts`
- **New page** → `src/app/(app)/routeName/page.tsx`
- **Never** put business logic in `app/` pages — pages are thin wrappers around components
- **Never** import from `lib/api/` directly in a component — always go through a hook
