# Code Standards — Lumora Frontend

## Naming Convention: camelCase Everywhere

| Thing | Convention | Example |
|---|---|---|
| Variables | camelCase | `selectedLayerId` |
| Functions | camelCase | `handlePromptSubmit` |
| React components | PascalCase | `LayerChip` |
| Component files | camelCase | `layerChip.tsx` |
| Hook files | camelCase, prefix `use` | `useTimeline.ts` |
| Store files | camelCase, suffix `Store` | `editorStore.ts` |
| Type files | camelCase | `timeline.ts` |
| CSS classes | kebab-case (Tailwind only) | `bg-surface-2` |
| Next.js convention files | as required | `page.tsx`, `layout.tsx` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PROMPT_LENGTH` |
| Enum values | PascalCase | `JobStatus.Running` |

---

## TypeScript

- Strict mode on. No `any`. If a type is unknown, use `unknown` and narrow it.
- All API response types live in `src/types/`. Never define types inline in components.
- Use `type` not `interface` for object shapes (exception: interfaces for class contracts).
- Use discriminated unions for state that has multiple modes:

```ts
// Good
type JobState =
  | { status: 'idle' }
  | { status: 'running'; percent: number; message: string }
  | { status: 'complete'; layerId: string }
  | { status: 'escalated'; bestAttemptAssetId: string; reason: string }
  | { status: 'error'; message: string }

// Bad
type JobState = {
  status: string
  percent?: number
  layerId?: string
  // ...
}
```

- Avoid `!` non-null assertions. If something might be null, handle it.
- Export types from `src/types/index.ts` for clean imports.

---

## React Patterns

### Component Structure

```tsx
// Standard component file structure
import { useState } from 'react'
import type { Layer } from '@/types'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/lib/utils/cn'

type LayerChipProps = {
  layer: Layer
  onSelect: (id: string) => void
}

export function LayerChip({ layer, onSelect }: LayerChipProps) {
  // 1. Hooks
  const selectedLayerId = useEditorStore(s => s.selectedLayerId)
  const [isDragging, setIsDragging] = useState(false)

  // 2. Derived state
  const isSelected = selectedLayerId === layer.id

  // 3. Handlers
  function handleClick() {
    onSelect(layer.id)
  }

  // 4. Render
  return (
    <div
      className={cn('layer-chip', isSelected && 'layer-chip--selected')}
      onClick={handleClick}
    >
      {layer.label}
    </div>
  )
}
```

### Rules

- One component per file.
- Props type declared above the component, named `{ComponentName}Props`.
- Use named exports, not default exports, for components. Exception: Next.js page files require default exports.
- No inline object literals in JSX props (causes unnecessary re-renders):

```tsx
// Bad
<Component style={{ color: 'red' }} />

// Good
const style = { color: 'red' }  // or use className
<Component style={style} />
```

- Event handlers named `handleVerb` or `onVerb` (handler vs prop):

```tsx
// Prop (passed in): onSelect, onChange, onSubmit
// Handler (defined here): handleSelect, handleChange, handleSubmit
```

---

## Zustand Stores

```ts
// Standard store pattern
import { create } from 'zustand'

type EditorState = {
  projectId: string | null
  selectedLayerId: string | null
  playheadPosition: number
}

type EditorActions = {
  setProject: (id: string) => void
  selectLayer: (id: string | null) => void
  setPlayheadPosition: (pos: number) => void
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  // State
  projectId: null,
  selectedLayerId: null,
  playheadPosition: 0,

  // Actions
  setProject: (id) => set({ projectId: id }),
  selectLayer: (id) => set({ selectedLayerId: id }),
  setPlayheadPosition: (pos) => set({ playheadPosition: pos }),
}))
```

- Always select specific slices in components (`useEditorStore(s => s.selectedLayerId)`), never the whole store.
- Async logic (API calls) does not live in stores — it lives in hooks. Stores are synchronous state containers only.

---

## API Client Pattern

```ts
// lib/api/jobs.ts
import { apiClient } from './client'
import type { Job, CreateJobPayload } from '@/types'

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  return apiClient.post<Job>('/api/jobs/', payload)
}

export async function getJob(jobId: string): Promise<Job> {
  return apiClient.get<Job>(`/api/jobs/${jobId}/`)
}
```

- All API functions are pure async functions — no hooks, no state.
- Always type both the request payload and the response.
- Errors throw `ApiError` (defined in `types/api.ts`) — never swallow them.

---

## Hook Pattern

```ts
// hooks/useJob.ts
import { useQuery } from '@tanstack/react-query'
import { getJob } from '@/lib/api/jobs'
import { useJobStore } from '@/stores/jobStore'

export function useJob(jobId: string) {
  const updateJob = useJobStore(s => s.updateJob)

  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    refetchInterval: (query) => {
      // Stop polling when terminal
      if (['complete', 'escalated', 'error'].includes(query.state.data?.status ?? '')) {
        return false
      }
      return 2000
    },
    onSuccess: (data) => updateJob(jobId, data),
  })
}
```

---

## Styling Rules

- Use Tailwind utility classes as the primary styling method.
- Use the `cn()` helper (clsx + tailwind-merge) for conditional classes.
- Never use inline `style` props for colors or spacing — use design token classes.
- CSS Modules allowed for complex component-specific styles (timeline canvas).
- Never override shadcn/ui component internals with arbitrary CSS — use the `className` prop and the theme variables.
- All layout is `flex` or `grid` — no absolute positioning except for the timeline playhead and overlay components.

---

## Anti-Patterns

```tsx
// ❌ Never do this
import { useEditorStore } from '@/stores/editorStore'
const store = useEditorStore() // selecting entire store
store.selectedLayerId           // now component re-renders on any store change

// ✅ Do this
const selectedLayerId = useEditorStore(s => s.selectedLayerId)

// ❌ Never do this
fetch('/api/jobs/', { ... }) // direct fetch in a component

// ✅ Do this
const { mutate } = useMutation({ mutationFn: createJob })

// ❌ Never do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Do this
<div>{userInput}</div>

// ❌ Never do this
localStorage.setItem('token', jwt)

// ✅ Token lives in httpOnly cookie, managed by the auth flow
```

---

## Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Always use `@/` imports, never relative paths that climb more than one level:

```ts
// Good
import { useTimeline } from '@/hooks/useTimeline'
import type { Layer } from '@/types/timeline'

// Bad
import { useTimeline } from '../../../hooks/useTimeline'
```
