# Lumora Frontend

> AI-augmented video editing studio. Describe your vision — Lumora builds the timeline.

Lumora is a generative video editor where AI produces fully editable layers on the same timeline you edit by hand. This repository contains the Next.js frontend that connects to the [Lumora FastAPI backend](https://github.com/your-org/lumora-backend).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Data Fetching | TanStack Query v5 |
| Real-time | Native WebSocket (job progress) |
| Media Playback | Video.js |
| Timeline UI | Custom canvas-based timeline component |
| Auth | Better Auth (JWT, shared with backend) |
| Package Manager | pnpm |

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- A running instance of the Lumora backend (see `/lumora-backend`)

---

## Quick Start

```bash
# Clone
git clone https://github.com/your-org/lumora-frontend.git
cd lumora-frontend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# → fill in NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL

# Start dev server
pnpm dev
```

App runs at `http://localhost:3002` (port 3000 is owned by the hermes WhatsApp bridge — it kills whatever is bound to :3000 on its ~5 min reconnect loop).

---

## Environment Variables

```env
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Lumora
```

---

## Project Structure

```
src/
  app/                  # Next.js App Router pages and layouts
  components/
    ui/                 # shadcn/ui base components
    editor/             # Timeline, canvas, layer panels
    ai/                 # Prompt bar, generation status, agentic feedback
    layout/             # Shell, sidebar, topbar
  hooks/                # Custom React hooks
  stores/               # Zustand stores
  lib/
    api/                # Typed API client (fetch wrappers)
    ws/                 # WebSocket client and event handlers
    utils/              # Shared utilities
  types/                # TypeScript domain types (mirrors backend models)
  styles/               # Global CSS and design tokens
```

See [`context/file-structure.md`](context/file-structure.md) for the full tree.

---

## Agent Context Files

All agent context files live in `/context`. If you are using an AI coding agent (Mimocode, Copilot, Cursor, etc.), point it at this directory before starting any task.

| File | Purpose |
|---|---|
| `project-overview.md` | What Lumora is and what we're building |
| `architecture.md` | Component hierarchy, data flow, module boundaries |
| `file-structure.md` | Full directory tree with role annotations |
| `ui-context.md` | Design tokens, component library, screen inventory |
| `workflows.md` | Key user flows mapped to components and API calls |
| `security.md` | Auth model, token handling, input rules |
| `code-standards.md` | Naming, formatting, patterns, anti-patterns |
| `frontend-roadmap.md` | Phased build order with acceptance criteria |

---

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

---

## Contributing

This project uses camelCase for all variables, functions, and file names (except page/layout files which follow Next.js conventions). See [`context/code-standards.md`](context/code-standards.md) for the full guide.

---

## License

MIT
