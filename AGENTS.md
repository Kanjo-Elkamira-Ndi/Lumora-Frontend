<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Package manager is **npm** (lockfile: `package-lock.json`). The README still says pnpm — ignore it. Run `npm install`, `npm run dev`, `npm run lint`, `npm run typecheck`. There is no `format` script.

Route-level auth guard lives in `src/proxy.ts` (NOT `middleware.ts`). The API client calls same-origin `/api/*`, proxied to the backend on :8000 by `src/app/api/[...path]/route.ts`.
