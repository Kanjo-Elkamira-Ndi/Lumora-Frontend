# Project Overview — Lumora Frontend

## What Is Lumora?

Lumora is a generative video editing studio built for the Backblaze Generative Media Hackathon (deadline: August 3, 2026). It is a web application where users describe what they want in plain language, and AI generates fully editable media layers — audio, video, images, text, transitions — directly onto a timeline the user can also edit by hand.

The core promise: **AI produces editable layers, not baked outputs.** Every AI-generated asset lands on the timeline as a movable, deletable, adjustable layer — not a locked render.

---

## What This Repository Is

This is the **Next.js frontend** for Lumora. It communicates with a FastAPI backend (`lumora-backend`) over REST and WebSocket. The frontend handles:

- The editor shell (timeline, preview, layer controls)
- The AI prompt interface (prompt bar, generation status, agentic retry feedback)
- Project and asset management
- Real-time job progress via WebSocket
- Authentication (login, signup, session management)

---

## Audience

Content creators, video editors, and non-technical users who want AI to do the heavy lifting of compositing, but still want full manual control over the result.

---

## Backend Contract

The backend exposes these endpoints. The frontend consumes all of them:

| Endpoint | What the frontend uses it for |
|---|---|
| `POST /api/projects/` | Create new project |
| `GET /api/projects/{id}/timeline/` | Load timeline state |
| `PATCH /api/projects/{id}/timeline/` | Save manual edits |
| `POST /api/jobs/` | Submit AI generation prompt |
| `GET /api/jobs/{id}/` | Poll job status |
| `WS /ws/jobs/{id}/` | Real-time job progress |
| `GET /api/assets/?q=&tags=` | Search asset library |
| `GET /api/assets/{id}/manifest/` | View asset provenance |
| `POST /api/exports/` | Trigger final video render |

All API responses use camelCase. All request bodies use camelCase.

---

## AI Generation Tiers (for UI purposes)

The backend processes AI jobs in three tiers. The frontend must communicate this to the user:

- **Tier 0** — instant, free (captions, transition suggestions, cut points). No loading state needed beyond a spinner.
- **Tier 1** — seconds to minutes, uses credits (voiceover, music, image gen via Genblaze). Show a progress bar with estimated time.
- **Agentic loop** — may retry up to 3 times, may escalate to human review. Show attempt count, evaluation result per attempt, and an escalation state if the loop gives up.

---

## Design Screens (from Google Stitch)

Screens designed and ready for implementation:

1. Landing / auth (login + signup)
2. Dashboard (project list, new project CTA)
3. Editor — main shell
   - Timeline panel (tracks, layers, playhead)
   - Preview panel (video player)
   - AI prompt bar (bottom)
   - Layer properties panel (right sidebar)
   - Asset library panel (left sidebar)
4. Job status overlay (Tier 1 + agentic progress)
5. Asset manifest / provenance drawer
6. Export modal
7. Settings (account, billing)

---

## Key Constraints

- Hackathon deadline: **August 3, 2026**. Scope must be demo-able, not production-complete.
- The demo video is ~3 minutes. The editor must work end-to-end: prompt → generation → timeline layer → export.
- Mobile is not a priority for the hackathon build. Desktop (1280px+) first.
- All text in the UI is English only for the hackathon build.
