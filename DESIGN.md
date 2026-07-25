---
name: Luminous Precision
colors:
  surface: '#1d100b'
  surface-dim: '#1d100b'
  surface-bright: '#46362f'
  surface-container-lowest: '#170b07'
  surface-container-low: '#261813'
  surface-container: '#2a1c17'
  surface-container-high: '#362720'
  surface-container-highest: '#41312b'
  on-surface: '#f8ddd3'
  on-surface-variant: '#e2bfb2'
  inverse-surface: '#f8ddd3'
  inverse-on-surface: '#3d2d26'
  outline: '#a98a7e'
  outline-variant: '#5a4137'
  surface-tint: '#ffb597'
  primary: '#ffb597'
  on-primary: '#581d00'
  primary-container: '#ff6a1a'
  on-primary-container: '#591e00'
  inverse-primary: '#a43d00'
  secondary: '#c8c6c9'
  on-secondary: '#303033'
  secondary-container: '#47464a'
  on-secondary-container: '#b6b4b8'
  tertiary: '#c8c5cb'
  on-tertiary: '#303034'
  tertiary-container: '#99989d'
  on-tertiary-container: '#313035'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb597'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#e4e1e5'
  secondary-fixed-dim: '#c8c6c9'
  on-secondary-fixed: '#1b1b1e'
  on-secondary-fixed-variant: '#47464a'
  tertiary-fixed: '#e4e1e7'
  tertiary-fixed-dim: '#c8c5cb'
  on-tertiary-fixed: '#1b1b1f'
  on-tertiary-fixed-variant: '#47464b'
  background: '#1d100b'
  on-background: '#f8ddd3'
  surface-variant: '#41312b'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  section-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  mono-label:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  panel-gap: 1px
  element-gap: 12px
  toolbar-height: 48px
---

## Brand & Style
The design system is engineered for a high-performance creative environment where the interface recedes to prioritize content. The personality is professional, technical, and focused, catering to creators who require a "heads-down" workspace.

The aesthetic follows a **Sleek Corporate/Modern** approach with a heavy emphasis on **Minimalism**. By utilizing a deep, monochromatic foundation punctuated by a single high-energy accent, the UI evokes a sense of "the dark studio"—a place where artificial intelligence and human creativity intersect. Visual hierarchy is established through subtle tonal shifts rather than decorative elements, ensuring the tool feels like a precise instrument.

## Colors
The palette is rooted in a deep charcoal scale to minimize eye strain during long editing sessions. 

- **Primary (#FF6A1A):** Reserved exclusively for intent. Use for the playhead, active selection outlines, primary call-to-action buttons, and critical progress indicators.
- **Surface Tiers:** 
    - Layer 0 (#141416): The application canvas and background.
    - Layer 1 (#1D1D20): Sidebars, property panels, and toolbars.
    - Layer 2 (#26262A): Popovers, modals, and card elements.
- **Typography:** Pure white is reserved for high-contrast headlines and active labels. Secondary text uses a muted zinc gray to maintain a clean visual hierarchy.

## Typography
This design system utilizes **Inter** for its neutral, highly legible characteristics in digital interfaces.

- **Section Headers:** Utilize a specialized "Small Caps" or Uppercase style with increased letter spacing (0.06em) to differentiate functional blocks without increasing font size.
- **Data Display:** For timestamps, frame counts, and coordinates, a monospaced font (Geist) should be used to prevent layout shift during playback.
- **Hierarchy:** Weight is used more frequently than size to denote importance, maintaining a compact footprint for information-dense panels.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for the core application shell (panels) and a **Fluid** approach for the internal content of the timeline and canvas.

- **Panel Construction:** Use a 1px gap (the border color #26262A) between major UI sections to create a "tiled" look typical of professional creative suites.
- **Rhythm:** All spacing is based on a 4px baseline. 12px and 16px are the primary increments for internal padding.
- **Responsive Behavior:** On desktop, panels are collapsible. On tablet, the property inspector moves to a bottom-sheet or hidden drawer to prioritize the preview canvas.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

- **Structural Depth:** Higher elevation levels are represented by lighter surface colors. A modal sitting on top of the workspace will use the Tertiary color (#26262A).
- **Borders:** Every panel and card must have a 1px solid border of #26262A. This creates structural definition in a dark environment where shadows are often invisible.
- **Focus States:** Active inputs or selected clips use a 1px stroke of the Primary Orange or a subtle outer glow with 0% offset and 4px blur.

## Shapes
The shape language is precise and controlled.

- **Standard Elements:** Buttons, input fields, and cards utilize a **0.5rem (8px)** radius.
- **Large Containers:** Modals and large content areas utilize **1rem (16px)** radius.
- **Interactive Micro-elements:** Tooltips and small icon buttons use a **0.25rem (4px)** radius to maintain a sharp, professional feel.

## Components

### Buttons
- **Primary:** Background #FF6A1A, Text #FFFFFF. Bold, used for "Export" or "Generate."
- **Secondary:** Background #26262A, Border 1px #3F3F46, Text #FFFFFF.
- **Ghost:** No background, Text #A1A1AA. Turns #FFFFFF on hover. Use for timeline tools.

### Inputs & Dropdowns
- **Field:** Background #141416, Border 1px #26262A. Text is #FFFFFF. 
- **Active State:** Border color shifts to #FF6A1A.

### Timeline & Tracks
- **Tracks:** Background #1D1D20. 
- **Clips:** Background #26262A with a subtle 1px border. 
- **Playhead:** A 2px wide line of #FF6A1A with a triangular handle at the top.

### Badges / Status Indicators
- **Base:** Small caps text, 4px roundedness, 8px horizontal padding.
- **Processing:** Background #26262A, Text #A1A1AA (with a subtle pulse animation).
- **Passed:** Text #10B981 (Emerald).
- **Needs Review:** Text #F59E0B (Amber).

### Cards
- Used for media assets in the library. Should feature a hover-state play button overlay and a 2px Primary Orange bottom-border when the asset is "In Use" on the timeline.

## Screen Layouts

| Screen ID | X | Y | Width | Height | Hidden |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `0440437d182b4eb1a208136fe9a894da` | 576 | 2566 | 1280 | 1058 | |
| `06ad0d024b764975b924053f6d9818c6` | 0 | 15279 | 512 | 286 | |
| `0f5dcc44e63841838e782fe1f1a3d1f6` | 0 | 2566 | 512 | 763 | |
| `1005a6e10e164a299e9cad895b942a16` | 0 | 9000 | 48 | 48 | |
| `1888a181054047c08cb7b25225be49a5` | 1344 | 3880 | 1280 | 1024 | |
| `1b52a658bfc74a5b8ce1194d4a3dd33b` | 2688 | 3880 | 1280 | 1024 | |
| `28b1a2ed829f4aee930dec367d31ad40` | 0 | 11076 | 1280 | 3914 | Yes |
| `37c7a5b1d63e433b93e29021aef51617` | 0 | 19809 | 1280 | 3915 | |
| `3b069e20cd044e5fa789cf2fee2b6e0e` | 2688 | 7720 | 1280 | 1024 | |
| `3cb08f17346d4cc6a75a20e04357ea04` | 1344 | 1280 | 1280 | 1024 | Yes |
| `40411efb5114412c916c611c71f41404` | 1344 | 11076 | 1280 | 2302 | |
| `40587dbd06144420b1fbe06413b73949` | 2688 | 5160 | 1280 | 1024 | |
| `49be0416ca634da29ce8744ae87a2fad` | 1024 | 0 | 1280 | 1024 | |
| `52a4b989c21e46f6b01f3ff2409a2003` | 2688 | 6440 | 1280 | 1024 | |
| `5c7bf5b8666845a881d84a00fc78e2ac` | 0 | 1280 | 1280 | 1030 | Yes |
| `7584a03312d046829fb3ef3e68d83cfe` | -130 | 11076 | 1280 | 3370 | |
| `7b6b5a5032bf4088a4f0c354165688e5` | 200 | 9000 | 1280 | 1024 | |
| `85bfffdd8d1341fdb421d5e066e23c5f` | 0 | 3880 | 1280 | 1024 | |
| `8f7af662730c4c2282ce859097c53451` | 1920 | 2566 | 1280 | 1024 | |
| `a152efc8949749bc917877631e67d23e` | 1344 | 6440 | 1280 | 1024 | |
| `b037f66f8686420f8e86edec7a8e1dc7` | 0 | 6440 | 1280 | 1024 | |
| `b56643ed2aa046d084ff5ae176ad4d53` | 2688 | 11076 | 1280 | 3947 | |
| `bd543eacc6b940c6b0c5578d84183122` | 1344 | 7720 | 1280 | 1024 | |
| `bd7dc4f585e6475b947ef849c2f7452f` | 112 | 9000 | 24 | 24 | |
| `d5e5c7ae47a346138a3c9d50e6688783` | 576 | 15279 | 1280 | 4274 | |
| `e94c34faab804a2cacbf476508a49d3b` | 0 | 7720 | 1280 | 1024 | |
| `fb31befc2fbf4afc91c7e6b2f4cfb51d` | 1344 | 5160 | 1280 | 1024 | |
| `fd35944f0ed4468cb08bff3271bd0006` | 0 | 5160 | 1280 | 1024 | |
