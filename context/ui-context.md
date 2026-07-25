# UI Context — Lumora Frontend

## Brand Identity

Lumora is a dark-first creative tool. The visual language is cinematic, precise, and editor-native — think Premiere Pro crossed with a modern AI product. The UI should feel like a professional tool, not a consumer app.

---

## Design Tokens

### Color Palette

```css
/* src/styles/tokens.css */
:root {
  /* Brand */
  --color-primary:    #FF6A1A;   /* Orange — CTAs, active states, accents */
  --color-secondary:  #1D1D20;   /* Near-black — main background */
  --color-tertiary:   #26262A;   /* Panel backgrounds, cards */
  --color-neutral:    #141416;   /* Deepest background, timeline canvas */

  /* Primary scale */
  --color-primary-hover:   #E85C0F;   /* Darker orange for hover */
  --color-primary-subtle:  #FF6A1A1A; /* 10% opacity — selection highlights */
  --color-primary-muted:   #FF6A1A40; /* 25% opacity — borders on active layers */

  /* Text */
  --color-text-primary:    #F2F2F2;   /* Main text */
  --color-text-secondary:  #9B9BA0;   /* Labels, metadata */
  --color-text-muted:      #5C5C63;   /* Placeholders, disabled */

  /* Surface */
  --color-surface-0:  #141416;   /* Deepest — neutral/timeline bg */
  --color-surface-1:  #1D1D20;   /* Main app background */
  --color-surface-2:  #26262A;   /* Panels, cards */
  --color-surface-3:  #303036;   /* Elevated: modals, dropdowns, hover states */

  /* Borders */
  --color-border:        #303036;
  --color-border-strong: #454550;

  /* Semantic */
  --color-success:  #22C55E;
  --color-warning:  #EAB308;
  --color-error:    #EF4444;
  --color-info:     #3B82F6;

  /* AI Tiers */
  --color-tier-0:      #9B9BA0;   /* Gray — instant, free */
  --color-tier-1:      #FF6A1A;   /* Orange — generation */
  --color-tier-agentic:#A855F7;   /* Purple — agentic loop */
}
```

### Typography

```css
:root {
  --font-sans:  'Inter', system-ui, sans-serif;      /* Body, UI labels */
  --font-mono:  'JetBrains Mono', monospace;         /* Timecodes, manifests */

  /* Scale */
  --text-xs:   11px;
  --text-sm:   12px;
  --text-base: 14px;    /* Default UI text */
  --text-md:   16px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;

  /* Leading */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
}
```

### Spacing & Radius

```css
:root {
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  12px;

  --panel-gap:    1px;     /* Gap between editor panels (dark line) */
  --layer-height: 36px;    /* Height of one timeline track row */
}
```

---

## Tailwind Configuration

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary:   '#FF6A1A',
        secondary: '#1D1D20',
        tertiary:  '#26262A',
        neutral:   '#141416',
        surface: {
          0: '#141416',
          1: '#1D1D20',
          2: '#26262A',
          3: '#303036',
        },
        text: {
          primary:   '#F2F2F2',
          secondary: '#9B9BA0',
          muted:     '#5C5C63',
        },
        tier: {
          0:       '#9B9BA0',
          1:       '#FF6A1A',
          agentic: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      }
    }
  }
}
```

---

## shadcn/ui Theme Overrides

shadcn components must be overridden to match Lumora's dark palette. In `globals.css`:

```css
.dark {
  --background:       14 14 16;     /* #141416 */
  --foreground:       242 242 242;
  --card:             29 29 32;
  --card-foreground:  242 242 242;
  --popover:          38 38 42;
  --popover-foreground: 242 242 242;
  --primary:          255 106 26;   /* #FF6A1A */
  --primary-foreground: 255 255 255;
  --secondary:        38 38 42;
  --secondary-foreground: 242 242 242;
  --muted:            48 48 54;
  --muted-foreground: 155 155 160;
  --accent:           48 48 54;
  --accent-foreground: 242 242 242;
  --destructive:      239 68 68;
  --border:           48 48 54;
  --input:            48 48 54;
  --ring:             255 106 26;
}
```

Always set `<html class="dark">` — Lumora is dark-mode only.

---

## Screen Inventory

These are all screens from the Google Stitch design. Each is a page or a major overlay:

| Screen | Route | Type |
|---|---|---|
| Login | `/login` | Page |
| Signup | `/signup` | Page |
| Dashboard | `/dashboard` | Page |
| Editor | `/editor/[projectId]` | Page (CSR) |
| Job status overlay | (within editor) | Overlay/drawer |
| Asset manifest drawer | (within editor) | Drawer |
| Export modal | (within editor) | Modal |
| Settings | `/settings` | Page |

---

## Component Visual Specs

### LayerChip (timeline layer block)

- Background: `--color-surface-3` (#303036)
- Border: 1px solid `--color-border`
- When selected: border `--color-primary`, background `--color-primary-subtle`
- Source badge (top-right corner):
  - `manual` → no badge
  - `llm_suggested` → gray pill "AI"
  - `genblaze_generated` → orange pill "GEN"
- Height: `var(--layer-height)` = 36px
- Radius: `var(--radius-sm)` = 4px

### TierBadge

- Tier 0: gray pill, text "Instant"
- Tier 1: orange pill, text "Generating"
- Agentic: purple pill, text "Agentic · attempt N/3"

### PromptBar

- Position: bottom of editor, full width
- Background: `--color-surface-2`
- Border-top: 1px solid `--color-border`
- Input: no border, `--color-surface-3` background, `--color-text-primary`
- Submit button: `--color-primary` background, white text, "Generate"
- Tier selector: small dropdown left of input

### AgenticRunCard

- Shows current attempt number (e.g. "Attempt 2 of 3")
- Shows evaluation checks with pass/fail icons
- Shows failure reason if retrying
- Shows "Needs review" state if escalated, with a CTA to view the best attempt

---

## Icon Library

Use `lucide-react` exclusively. Import individually:

```tsx
import { Play, Pause, Scissors, Plus, Upload, Wand2, Clock } from 'lucide-react'
```

Icon size defaults:
- UI controls: 16px
- Toolbar buttons: 18px
- Empty states: 40px

---

## Animation Principles

- Transitions: 150ms ease for hover states, 200ms ease for panel open/close
- No decorative animation — every motion communicates state change
- Respect `prefers-reduced-motion`: wrap all animations in the media query
- Layer drag: no spring physics, pure `transform: translateX()` for performance
