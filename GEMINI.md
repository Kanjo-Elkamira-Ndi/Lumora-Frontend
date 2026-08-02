# GEMINI.md — Lumora Frontend (Antigravity IDE Rules)

## Project Identity
- App name: Lumora — AI-augmented generative video editing studio
- Repo: lumora-frontend
- Deadline: August 3, 2026 (hackathon build — demo-ready, not production-complete)

## Tech Stack (never deviate from this)
- Framework: Next.js 15, App Router only — NO pages/ directory, NO TanStack Router
- Language: TypeScript strict mode
- Styling: Tailwind CSS v4 + CSS custom properties
- UI Components: shadcn/ui (dark theme only)
- State: Zustand (UI/client state), TanStack Query v5 (server/async state)
- Real-time: Native WebSocket — NO socket.io
- Auth: Better Auth with httpOnly cookie — NEVER localStorage
- Package manager: pnpm — never npm or yarn

## Design System (enforce absolutely)
- Primary color: #FF6A1A (orange) — CTAs, active states, accents only
- Secondary: #1D1D20 — main app background
- Tertiary: #26262A — panels and cards
- Neutral: #141416 — deepest background, timeline canvas
- App is dark-mode only — always set <html className="dark">
- Never use hardcoded colors in components — always use CSS variables or Tailwind tokens
- Design source of truth: Google Stitch (fetch via MCP before implementing any screen)

## Naming Convention (camelCase everywhere)
- Variables: camelCase
- Functions: camelCase
- Component files: camelCase (e.g. layerChip.tsx, promptBar.tsx)
- React components: PascalCase (e.g. LayerChip, PromptBar)
- Hooks: camelCase, prefix "use" (e.g. useTimeline.ts)
- Store files: camelCase, suffix "Store" (e.g. editorStore.ts)
- Constants: SCREAMING_SNAKE_CASE
- Next.js convention files as required: page.tsx, layout.tsx, loading.tsx

## File Placement Rules (never violate)
- New component → src/components/{domain}/componentName.tsx
- New hook → src/hooks/useResourceName.ts
- New store → src/stores/resourceStore.ts
- New API function → src/lib/api/resource.ts
- New type → src/types/domain.ts
- New page → src/app/(app)/routeName/page.tsx
- Never put business logic in app/ pages — pages are thin wrappers only
- Never import from lib/api/ directly in components — always go through a hook

## Module Boundary Rules
- components/ → can import from hooks/, stores/, lib/, types/
- hooks/ → can import from lib/, stores/, types/ only
- stores/ → synchronous only, no async API calls
- lib/api/ → typed fetch wrappers only, no hooks or state
- lib/ws/ → WebSocket client only, no React

## Code Patterns
- One component per file
- Named exports only (except Next.js page files which require default export)
- Props type declared above component as {ComponentName}Props
- No inline object literals in JSX props
- Event handlers: handleVerb (internal), onVerb (prop)
- No dangerouslySetInnerHTML anywhere
- No any — use unknown and narrow if type is uncertain
- Always select Zustand store slices: useStore(s => s.field) not useStore()
- API errors throw ApiError — never swallow them

## Security Rules (absolute — never bypass)
- JWT lives in httpOnly cookie only — never localStorage, never sessionStorage
- Never call FastAPI backend URL directly from client components
- All backend calls go through src/app/api/[...path]/route.ts proxy
- WebSocket is the only exception — uses NEXT_PUBLIC_WS_URL
- API_URL and AUTH_SECRET are server-only — never prefix with NEXT_PUBLIC_

## Design-to-Code Behavior
- Before implementing ANY screen or component: fetch the corresponding Stitch screen via MCP
- Always cross-reference the Stitch design with ui-context.md tokens
- Never approximate colors from memory — always pull from the design system
- Match the Stitch layout exactly; use the browser panel to vibe-check against the original

## Agent Behavior
- Always read context/ directory files at session start
- Always plan before coding — output a brief checklist before writing any file
- When a file would exceed 300 lines, split it
- Never delete files without explicit confirmation
- Never commit .env files
- After implementing a screen, open the integrated browser and compare to Stitch design
- If a visual discrepancy is found, fix it before moving to the next task

## Response Style
- Skip basic explanations — I am an experienced developer
- Be concise, show code
- When suggesting architectural changes, explain the why
- If you spot a potential bug or anti-pattern, flag it before proceeding