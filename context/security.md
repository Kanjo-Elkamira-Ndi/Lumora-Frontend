# Security — Lumora Frontend

## Auth Model

Lumora uses **JWT-based auth** via Better Auth (same library as the backend). The frontend stores the JWT in an `httpOnly` cookie — never in localStorage or sessionStorage.

### Session Flow

```
User logs in (POST /auth/login)
  → Backend sets httpOnly cookie: lumora_session=<JWT>
  → authStore.setUser(user) — stores user metadata only, NOT the token
  → Router pushes to /dashboard
```

The JWT is never accessible from JavaScript (`httpOnly`). All API requests include it automatically via the cookie — no manual `Authorization` header needed from client code.

### Auth Middleware

```ts
// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  const session = request.cookies.get('lumora_session')
  if (!session && !isPublicRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

### API Proxy Layer

All API calls go through `app/api/[...path]/route.ts` which:
1. Reads the session cookie (server-side only)
2. Attaches the JWT as `Authorization: Bearer <token>` to the outbound request to FastAPI
3. Forwards the response

This keeps the FastAPI URL and JWT handling entirely on the server — they are never exposed to the browser.

```ts
// app/api/[...path]/route.ts (simplified)
export async function GET(request: NextRequest, { params }) {
  const session = cookies().get('lumora_session')?.value
  const apiUrl = `${process.env.API_URL}/${params.path.join('/')}`
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${session}`,
      'Content-Type': 'application/json',
    },
  })
  return response
}
```

---

## Environment Variables

| Variable | Where it lives | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `.env.local` | Yes (only for WS URL construction) |
| `NEXT_PUBLIC_WS_URL` | `.env.local` | Yes (WebSocket endpoint) |
| `API_URL` | `.env.local` (server only) | **No** — never prefix with NEXT_PUBLIC_ |
| `AUTH_SECRET` | `.env.local` (server only) | **No** |

Rule: if a variable is server-only, **do not** prefix it with `NEXT_PUBLIC_`. It will be bundled into the client if you do.

---

## Input Sanitization

### AI Prompt Input

- Max length: 500 characters (enforced client-side; backend also validates)
- No HTML sanitization needed — prompts are plain text, never rendered as HTML
- Trim whitespace before submission
- Block empty submissions

### File Uploads (asset library)

- Accepted MIME types: `video/mp4`, `video/webm`, `audio/mpeg`, `audio/wav`, `image/jpeg`, `image/png`
- Max file size: 500MB (enforced client-side before upload; backend validates)
- File name sanitization: replace non-alphanumeric characters with underscores before display

---

## XSS Prevention

- Never use `dangerouslySetInnerHTML` anywhere in the codebase
- Asset names, project names, and user-supplied strings are always rendered as text content, never HTML
- The asset manifest drawer renders JSON data as formatted code, not raw HTML

---

## CORS

The FastAPI backend is configured to accept requests only from the frontend origin. The Next.js API proxy handles all cross-origin communication — frontend JavaScript never calls the FastAPI backend directly (except WebSocket, which uses the `NEXT_PUBLIC_WS_URL`).

---

## WebSocket Security

- The WebSocket URL is constructed as: `${NEXT_PUBLIC_WS_URL}/ws/jobs/${jobId}/`
- The jobId is a UUID from the server — never user-supplied
- WS connections are opened only for jobs belonging to the current user (enforced server-side)
- On auth failure, the server closes the WS with code 4001 — the client shows an error toast and does not retry

---

## What NOT to Do

- **Never** store the JWT in localStorage
- **Never** call the FastAPI backend URL directly from client components — always use the Next.js proxy
- **Never** render user-supplied content as HTML
- **Never** log JWT tokens or user PII to the console
- **Never** expose `API_URL` or `AUTH_SECRET` to the client bundle
