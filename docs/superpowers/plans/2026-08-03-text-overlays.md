# Text Overlays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users manually create rich-styled text overlays in the Lumora editor (create, style, drag on the live preview, export correctly), and fix the existing render bug where AI-caption text never shows up.

**Architecture:** Two independent git repos (backend `Lumora/`, frontend `Lumora-Frontend/`). Backend: extend the Pydantic `TextParams` model (new styling props + a `content` alias that fixes the `params.text` vs `params.content` mismatch), add a font resolver, teach `buildTextFilter` about outline/shadow/box/opacity/fontfile, and add a `filter_complex` rendering path for rotated text (validated empirically on ffmpeg 7.1). Frontend: a Text tab creator, a shared `TextStyleControls` component used by both the creator and the properties panel, CSS `<div>` overlays on the existing `<video>` preview scaled to the rendered video box, drag-to-reposition, and double-click in-canvas editing.

**Tech Stack:** FastAPI + Pydantic v2 + ffmpeg 7.1 (backend, `uv`); Next.js 16.2.11 + React 19 + Zustand + Radix (frontend, npm). Tests: standalone scripts (`uv run python test.py`) — **never `test_tier1.py`** (paid API calls). Frontend verification is `npm run lint` + `npm run typecheck` (no test runner exists).

**Ports (operational):** backend `:8001` (`uv run uvicorn main:app --port 8001`), frontend `:3002` (`npm run dev`). `:3000` = hermes (never use), `:8000` = unrelated MamaSafe (leave alone).

---

## File Map

Backend (`/home/ace/Projects/Lumora_B2/Lumora/`):

- `models/renderParams.py` — extend `TextParams` (Tasks 1)
- `core/renderer/fonts.py` — NEW font resolver (Task 2)
- `core/renderer/ffmpegGraph.py` — rich `buildTextFilter`, new `buildFilterComplexGraph`, complex path in `applyVideoFilters` (Tasks 3–4)
- `test.py` — extend with new test functions + wire into `main()` (Tasks 1–4)

Frontend (`/home/ace/Projects/Lumora_B2/Lumora-Frontend/`):

- `src/components/editor/properties/textStyleControls.tsx` — NEW shared styling controls (Task 6)
- `src/components/editor/assets/textTab.tsx` — NEW Text tab creator (Task 7)
- `src/components/editor/assets/assetLibraryPanel.tsx` — mount TextTab (Task 7)
- `src/components/editor/previewPanel.tsx` — text overlay rendering, drag, inline edit (Tasks 8–9)
- `src/components/editor/properties/layerPropertiesPanel.tsx` — use TextStyleControls, fix hardcoded position fields (Task 10)

---

## Conventions

- Backend first-party functions are camelCase. No DB migration is needed — text props live in the existing `params` JSONB column.
- Renderer bucket kind for effects is `"effects"` (backend) and frontend track `type` is `"effect"` — do not change.
- Text is positioned by **fraction** (`position: {x, y}` in 0..1) and is **center-anchored** in both ffmpeg `drawtext` and the CSS preview. The preview scales text sizes by `videoBoxWidth / 1920`.
- Rotation is stored in **degrees** everywhere in the UI/JSON; only the ffmpeg graph converts to radians (`math.radians`).
- Commit per task in the matching repo with a lowercase conventional message (`feat:`, `fix:`).

---

## Task 0: Baseline check

**Files:** none (verification only)

- [ ] **Step 1: Confirm servers are up**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/health || true; curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 || true`
Expected: both return a 2xx/3xx code (or a non-empty body). If either is down, restart:
- backend: `cd /home/ace/Projects/Lumora_B2/Lumora && nohup uv run uvicorn main:app --port 8001 > /tmp/backend-exit.log 2>&1 &`
- frontend: `cd /home/ace/Projects/Lumora_B2/Lumora-Frontend && nohup npm run dev > /tmp/frontend-exit3002.log 2>&1 &`

- [ ] **Step 2: Baseline backend tests**

Run (from `/home/ace/Projects/Lumora_B2/Lumora`): `uv run python test.py`
Expected: all existing tests print `✅ ... passed!` and the run ends with `🎉 ALL TESTS PASSED!`. Record the output so Task 5 can be diffed against it.

---

## Task 1: Extend `TextParams` with styling props + `content` alias

**Files:**
- Modify: `models/renderParams.py:28-36`
- Test: `test.py`

**Context:** Frontend writes text layers with `content` (see `aiAssistTab.tsx:107` and the new creator), but the renderer reads `TextParams(**layer.params)` then `buildTextFilter` reads `params.text`. Today a caption layer (which has `content` and **no** `text`) raises a Pydantic validation error inside `_parseTextLayers`, so text never renders. Add a `content` field plus a before-validator that aliases `content` → `text`, and add the new styling fields with backward-compatible defaults.

- [ ] **Step 1: Write the failing tests**

Append to `test.py` (after `testRenderEffectsOnly`, before `main`):

```python
async def testTextParamsContentAlias():
    print("=" * 60)
    print("TEST: TextParams content alias")
    print("=" * 60)

    p = TextParams(content="Hello")
    assert p.text == "Hello", f"Expected text='Hello', got {p.text!r}"

    p2 = TextParams(text="Direct")
    assert p2.text == "Direct"

    p3 = TextParams(content="Aliased", size=32, rotation=10.0)
    assert p3.text == "Aliased"
    assert p3.size == 32
    assert p3.rotation == 10.0
    assert p3.opacity == 1.0
    assert p3.outlineWidth == 0
    assert p3.shadowX == 0.0
    assert p3.box is False
    assert p3.boxBorderW == 8

    p4 = TextParams(**{"text": "Legacy dict", "size": 20})
    assert p4.text == "Legacy dict"

    print("✅ TextParams content alias passed!\n")
```

And add the call to `main()`:

```python
    await testRenderEffectsOnly()
    await testTextParamsContentAlias()
    await testRenderPipeline()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python test.py`
Expected: `testTextParamsContentAlias` raises `pydantic_core._pydantic_core.ValidationError` on `TextParams(content="Hello")` ("Unexpected keyword argument 'content'"), and the run aborts. The earlier tests still print `passed!`.

- [ ] **Step 3: Implement**

Edit `models/renderParams.py`. Change the import to:

```python
from pydantic import BaseModel, model_validator
```

Replace the `TextParams` class body (lines 28-36) with:

```python
class TextParams(BaseModel):
    text: str = ""
    content: str | None = None
    font: str = "Arial"
    fontFamily: str | None = None
    size: int = 48
    color: str = "white"
    bgColor: str | None = None
    position: dict = {"x": 0.5, "y": 0.9}
    startTime: float = 0.0
    duration: float | None = None
    outlineWidth: int = 0
    outlineColor: str = "black"
    shadowX: float = 0.0
    shadowY: float = 0.0
    shadowColor: str = "black"
    box: bool = False
    boxColor: str = "black"
    boxBorderW: int = 8
    rotation: float = 0.0
    opacity: float = 1.0

    @model_validator(mode="before")
    @classmethod
    def _aliasContentToText(cls, data):
        if isinstance(data, dict):
            text = data.get("text")
            content = data.get("content")
            if (text is None or text == "") and content is not None:
                return {**data, "text": content}
        return data
```

**Notes:** Pydantic v2 default is `extra="ignore"`, so existing AI title-card layers carrying `keyframes`/`easing` in `params` still validate fine. `content` stays the source of truth in JSONB; `text` is derived. Existing caption layers that pass `bgColor` continue to work.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run python test.py`
Expected: `✅ TextParams content alias passed!` and `🎉 ALL TESTS PASSED!`.

- [ ] **Step 5: Commit**

```bash
git add models/renderParams.py test.py
git commit -m "feat: extend TextParams with content alias and rich styling fields"
```

---

## Task 2: Font resolver

**Files:**
- Create: `core/renderer/fonts.py`
- Test: `test.py`

**Context:** `drawtext` accepts a `fontfile` path. Map the UI-facing family name (or the legacy `font` name) to an installed `.ttf`/`.otf`. These paths were verified present on the machine.

- [ ] **Step 1: Write the failing test**

Append to `test.py` (before `main`):

```python
async def testFontResolver():
    print("=" * 60)
    print("TEST: Font resolver")
    print("=" * 60)

    from core.renderer.fonts import resolveFontFile

    assert resolveFontFile(TextParams(font="Arial")) == \
        "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf"
    assert resolveFontFile(TextParams(fontFamily="Inter")) == \
        "/usr/share/fonts/rsms-inter-fonts/Inter-Regular.ttf"
    assert resolveFontFile(TextParams(fontFamily="Montserrat")) == \
        "/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Regular.otf"
    assert resolveFontFile(TextParams()) == \
        "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf"
    assert resolveFontFile(TextParams(fontFamily="NotARealFont")) == \
        "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf"

    print("✅ Font resolver passed!\n")
```

And add to `main()`:

```python
    await testTextParamsContentAlias()
    await testFontResolver()
    await testRenderPipeline()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python test.py`
Expected: `ModuleNotFoundError: No module named 'core.renderer.fonts'`.

- [ ] **Step 3: Implement**

Create `core/renderer/fonts.py`:

```python
from __future__ import annotations

from models.renderParams import TextParams

FONT_FILES: dict[str, str] = {
    "Inter": "/usr/share/fonts/rsms-inter-fonts/Inter-Regular.ttf",
    "Montserrat": "/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Regular.otf",
    "Source Code Pro": "/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Regular.otf",
    "Open Sans": "/usr/share/fonts/open-sans/OpenSans-Regular.ttf",
    "Liberation Sans": "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf",
    "Liberation Serif": "/usr/share/fonts/liberation-serif-fonts/LiberationSerif-Regular.ttf",
    "DejaVu Sans": "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf",
    "Arial": "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf",
}

DEFAULT_FONT_FILE = FONT_FILES["Liberation Sans"]


def resolveFontFile(params: TextParams) -> str:
    name = params.fontFamily or params.font or "Arial"
    return FONT_FILES.get(name, DEFAULT_FONT_FILE)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run python test.py`
Expected: `✅ Font resolver passed!` and `🎉 ALL TESTS PASSED!`.

- [ ] **Step 5: Commit**

```bash
git add core/renderer/fonts.py test.py
git commit -m "feat: add drawtext font resolver mapping family names to fontfile paths"
```

---

## Task 3: Rich `buildTextFilter` + `buildFilterComplexGraph`

**Files:**
- Modify: `core/renderer/ffmpegGraph.py:23-54` (buildTextFilter) and append `buildFilterComplexGraph` after it
- Test: `test.py`

**Context:** Extend the per-layer `drawtext` filter string with `fontfile`, outline (`bordercolor`/`borderw`), shadow (`shadowcolor`/`shadowx`/`shadowy`), box (via the new `box` flag; legacy `bgColor` still works), and opacity (appended as `@alpha` to `fontcolor`/`boxcolor`). Rotation cannot be expressed in `drawtext`, so it is handled at graph level: add `buildFilterComplexGraph`, which draws every text layer onto its own transparent `color=black@0` source, rotates the layer about its center (keeping the text's anchor point fixed), and overlays it at `width*(x-0.5), height*(y-0.5)`. This is equivalent to the old inline drawtext for non-rotated text and enables correct rotation for rotated text (validated empirically).

- [ ] **Step 1: Write the failing test**

Append to `test.py` (before `main`):

```python
async def testTextFilterRichOptions():
    print("=" * 60)
    print("TEST: buildTextFilter rich options")
    print("=" * 60)

    from core.renderer.ffmpegGraph import buildTextFilter, buildFilterComplexGraph

    f = buildTextFilter(
        TextParams(
            content="Hi There",
            fontFamily="Inter",
            size=40,
            color="white",
            outlineWidth=2,
            outlineColor="red",
            shadowX=3,
            shadowY=4,
            shadowColor="black",
            box=True,
            boxColor="black",
            boxBorderW=6,
            opacity=0.5,
            position={"x": 0.5, "y": 0.9},
            startTime=0.0,
            duration=2.0,
        ),
        10.0,
    )
    assert "fontfile=/usr/share/fonts/rsms-inter-fonts/Inter-Regular.ttf" in f
    assert "fontsize=40" in f
    assert "fontcolor=white@0.5" in f
    assert "bordercolor=red:borderw=2" in f
    assert "shadowcolor=black:shadowx=3:shadowy=4" in f
    assert "box=1:boxcolor=black@0.5:boxborderw=6" in f
    assert "enable=between(t\\,0.0\\,2.0)" in f

    legacy = buildTextFilter(
        TextParams(text="Legacy", bgColor="black", size=20),
        5.0,
    )
    assert "box=1:boxcolor=black@0.6:boxborderw=8" in legacy

    inputs, graph = buildFilterComplexGraph(
        textLayers=[
            TextParams(content="Rot", rotation=15.0, position={"x": 0.1, "y": 0.9}),
            TextParams(content="Plain", position={"x": 0.5, "y": 0.5}),
        ],
        effectLayers=[],
        width=640,
        height=480,
        duration=2.0,
        fps=30,
    )
    assert len(inputs) == 4  # -f lavfi -i color=... x2
    assert "[0:v]null[base]" in graph
    assert graph.count("rotate=") == 1
    assert "fillcolor=0x00000000" in graph
    assert "format=rgba" in graph
    assert "overlay=x=-256:y=192:format=auto" in graph
    assert "[base][t0]overlay=" in graph

    print("✅ buildTextFilter rich options passed!\n")
```

And add to `main()`:

```python
    await testFontResolver()
    await testTextFilterRichOptions()
    await testRenderPipeline()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python test.py`
Expected: `ImportError: cannot import name 'buildFilterComplexGraph'` (or an assertion on the new `fontfile`/`borderw`/`shadowx`/`box` options).

- [ ] **Step 3: Implement**

In `core/renderer/ffmpegGraph.py`:

1. Change the imports to add `import math` (after `import subprocess`) and `from core.renderer.fonts import resolveFontFile` (in the existing `from core.assets.assets import getMediaInfo` block area).

2. Replace the body of `buildTextFilter` (lines 23-54) with:

```python
def buildTextFilter(params: TextParams, videoDuration: float) -> str:
    x = params.position.get("x", 0.5)
    y = params.position.get("y", 0.9)

    if isinstance(x, float) and x <= 1.0:
        xExpr = f"(w*{x})-(text_w/2)"
    else:
        xExpr = str(x)

    if isinstance(y, float) and y <= 1.0:
        yExpr = f"(h*{y})-(text_h/2)"
    else:
        yExpr = str(y)

    escapeText = params.text.replace(":", "\\:").replace("'", "\\'")

    fontColor = params.color
    boxColor = params.boxColor
    if params.opacity < 1.0:
        fontColor = f"{fontColor}@{params.opacity}"
        boxColor = f"{boxColor}@{params.opacity}"

    parts = [
        f"drawtext=text={escapeText}",
        f"fontfile={resolveFontFile(params)}",
        f"fontsize={params.size}",
        f"fontcolor={fontColor}",
        f"x={xExpr}",
        f"y={yExpr}",
    ]

    if params.outlineWidth > 0:
        parts.append(f"bordercolor={params.outlineColor}:borderw={params.outlineWidth}")

    if params.shadowX != 0 or params.shadowY != 0:
        parts.append(
            f"shadowcolor={params.shadowColor}:shadowx={params.shadowX}:shadowy={params.shadowY}"
        )

    if params.box:
        parts.append(f"box=1:boxcolor={boxColor}:boxborderw={params.boxBorderW}")
    elif params.bgColor:
        bgOpacity = params.opacity if params.opacity < 1.0 else 0.6
        parts.append(f"box=1:boxcolor={params.bgColor}@{bgOpacity}:boxborderw=8")

    start = params.startTime
    end = start + (params.duration or videoDuration - start)
    parts.append(f"enable=between(t\\,{start}\\,{end})")

    return ":".join(parts)
```

3. Append the graph builder after `buildTextFilter` (before `buildEffectFilter`):

```python
def buildFilterComplexGraph(
    textLayers: list[TextParams],
    effectLayers: list[EffectParams],
    width: int,
    height: int,
    duration: float,
    fps: float,
) -> tuple[list[str], str]:
    """Build (extra ffmpeg inputs, filter_complex string) for text/effect overlays.

    Each text layer is drawn onto its own transparent full-frame source, rotated
    about its center when rotation != 0, then overlaid at width*(x-0.5),
    height*(y-0.5). The drawtext filter already center-anchors text at (w*x, h*y),
    so the overlay offset preserves the anchor through rotation.
    """
    inputs: list[str] = []
    graph: list[str] = []

    effectChain = ",".join(buildEffectFilter(e) for e in effectLayers)
    graph.append(f"[0:v]{effectChain if effectChain else 'null'}[base]")

    cur = "[base]"
    for i, t in enumerate(textLayers):
        idx = i + 1
        inputs.extend(
            [
                "-f", "lavfi",
                "-i", f"color=black@0:s={width}x{height}:d={duration}:r={int(fps)}",
            ]
        )
        layer = buildTextFilter(t, duration)
        if t.rotation != 0:
            layer = (
                f"{layer},rotate={math.radians(t.rotation)}:fillcolor=0x00000000,format=rgba"
            )
        graph.append(f"[{idx}:v]{layer}[t{i}]")
        px = float(t.position.get("x", 0.5))
        py = float(t.position.get("y", 0.9))
        ox = width * (px - 0.5)
        oy = height * (py - 0.5)
        graph.append(f"{cur}[t{i}]overlay=x={ox}:y={oy}:format=auto[v{i}]")
        cur = f"[v{i}]"

    return inputs, ";".join(graph)
```

**Note:** `buildEffectFilter` is referenced before its definition in the file (it is defined at line 57). That is fine at runtime since `buildFilterComplexGraph` only calls it when invoked. Keep the existing definition in place.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run python test.py`
Expected: `✅ buildTextFilter rich options passed!` and `🎉 ALL TESTS PASSED!`.

- [ ] **Step 5: Commit**

```bash
git add core/renderer/ffmpegGraph.py test.py
git commit -m "feat: rich drawtext options and filter_complex graph builder for rotated text"
```

---

## Task 4: `applyVideoFilters` rotation path

**Files:**
- Modify: `core/renderer/ffmpegGraph.py:70-119` (applyVideoFilters)
- Test: `test.py`

**Context:** When any text layer has `rotation != 0`, the simple single-input `-vf` chain cannot rotate just the text (the `rotate` filter spins the whole frame). Branch to a `filter_complex` command that feeds the base video in as input 0 and the transparent text layers as inputs 1..N, maps the final video label, and copies the original audio stream if present. Non-rotated text and effects keep the existing fast path unchanged.

- [ ] **Step 1: Write the failing integration test**

Append to `test.py` (before `main`):

```python
async def testRenderTextRichStyling():
    print("=" * 60)
    print("TEST: Render Text with Rich Styling + Rotation")
    print("=" * 60)

    video1 = _generateTestVideo(duration=3.0, color="blue")
    assetRegistry = {video1.id: video1}

    timeline = TimelineComposition(
        tracks=[
            TrackComposition(
                kind="video",
                position=0,
                layers=[
                    LayerComposition(
                        layerType="clip",
                        params=ClipParams(assetId=video1.id).model_dump(),
                        position=0,
                    ),
                ],
            ),
            TrackComposition(
                kind="text",
                position=1,
                layers=[
                    LayerComposition(
                        layerType="text",
                        params=TextParams(
                            content="Rotated Title",
                            fontFamily="Inter",
                            size=36,
                            color="yellow",
                            rotation=15.0,
                            opacity=0.8,
                            outlineWidth=2,
                            outlineColor="black",
                            shadowX=3,
                            shadowY=4,
                            position={"x": 0.5, "y": 0.2},
                            startTime=0.0,
                            duration=2.0,
                        ).model_dump(),
                        position=0,
                    ),
                    LayerComposition(
                        layerType="text",
                        params=TextParams(
                            content="Bottom Left",
                            size=28,
                            color="white",
                            box=True,
                            boxColor="black",
                            position={"x": 0.1, "y": 0.9},
                            startTime=0.0,
                            duration=2.0,
                        ).model_dump(),
                        position=1,
                    ),
                ],
            ),
        ],
    )

    result = await renderTimeline(timeline, assetRegistry)
    resultInfo = getMediaInfo(result)
    print(
        f"Rich text render: {resultInfo.duration:.2f}s, "
        f"resolution={resultInfo.resolution}"
    )

    assert result.localPath is not None
    assert Path(result.localPath).exists()
    assert resultInfo.duration is not None and resultInfo.duration > 0

    print("✅ Rich text render passed!\n")
```

And add to `main()`:

```python
    await testRenderSingleClip()
    await testRenderEffectsOnly()
    await testRenderTextRichStyling()
    await testRenderPipeline()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run python test.py`
Expected: `testRenderTextRichStyling` raises `subprocess.CalledProcessError` because the `-vf` chain with a `rotate` option fails (`Option 'rotate' not found`), or the text renders without rotation. Either way the run aborts with a non-zero exit.

- [ ] **Step 3: Implement**

Edit `core/renderer/ffmpegGraph.py`. Change the import from `models.asset` to also include `MediaInfo`:

```python
from models.asset import Asset, MediaInfo
```

Replace the body of `applyVideoFilters` (lines 70-119) with:

```python
def applyVideoFilters(
    videoAsset: Asset,
    textLayers: list[TextParams],
    effectLayers: list[EffectParams],
) -> Asset:
    if not textLayers and not effectLayers:
        return videoAsset

    info = getMediaInfo(videoAsset)
    src = Path(videoAsset.localPath)
    out = RENDER_DIR / f"filtered_{uuid.uuid4().hex}.mp4"

    if any(t.rotation != 0 for t in textLayers):
        return _applyVideoFiltersComplex(src, videoAsset, info, textLayers, effectLayers, out)

    filters = []
    for e in effectLayers:
        filters.append(buildEffectFilter(e))

    for t in textLayers:
        filters.append(buildTextFilter(t, info.duration or 0))

    if not filters:
        return videoAsset

    filterChain = ",".join(filters)

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(src),
            "-vf", filterChain,
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "medium",
            "-c:a", "copy",
            str(out),
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    return _newFilteredAsset(videoAsset, out)


def _applyVideoFiltersComplex(
    src: Path,
    videoAsset: Asset,
    info: MediaInfo,
    textLayers: list[TextParams],
    effectLayers: list[EffectParams],
    out: Path,
) -> Asset:
    width, height = info.resolution or (1920, 1080)
    duration = info.duration or 5.0
    fps = info.fps or 30

    inputs, filterComplex = buildFilterComplexGraph(
        textLayers,
        effectLayers,
        width,
        height,
        duration,
        fps,
    )

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(src),
            *inputs,
            "-filter_complex", filterComplex,
            "-map", "[v%d]" % (len(textLayers) - 1),
            "-map", "0:a?",
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "medium",
            "-c:a", "copy",
            str(out),
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    return _newFilteredAsset(videoAsset, out)


def _newFilteredAsset(videoAsset: Asset, out: Path) -> Asset:
    filtered = Asset(
        id=str(uuid.uuid4()),
        source=videoAsset.source,
        mimeType=videoAsset.mimeType,
        localPath=str(out),
        sha256=_sha256(out),
        tags=list(videoAsset.tags),
    )
    filtered.duration = getMediaInfo(filtered).duration
    return filtered
```

**Notes:**
- `buildFilterComplexGraph` always emits at least one text layer (we only enter this branch when `textLayers` is non-empty and contains a rotated layer), so `[v{N-1}]` is always a valid final label.
- `-map 0:a?` makes the audio map optional; the base video's audio is copied unchanged.
- The final label `"[v%d]" % (len(textLayers) - 1)` matches the last `[v{i}]` emitted by the graph builder.

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run python test.py`
Expected: `✅ Rich text render passed!` and `🎉 ALL TESTS PASSED!`.

- [ ] **Step 5: Commit**

```bash
git add core/renderer/ffmpegGraph.py test.py
git commit -m "feat: render rotated text via transparent-layer filter_complex pipeline"
```

---

## Task 5: Backend full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend suite**

Run (from `/home/ace/Projects/Lumora_B2/Lumora`): `uv run python test.py`
Expected: every test prints `✅ ... passed!` and the final line is `🎉 ALL TESTS PASSED!`. Diff the output against the Task 0 baseline — only new tests added.

- [ ] **Step 2: Sanity-check a manual layer render path (no code change)**

Run:
```bash
uv run python -c "
import asyncio
from models.renderParams import TextParams
from core.renderer.ffmpegGraph import buildFilterComplexGraph
from core.renderer.fonts import resolveFontFile
async def main():
    p = TextParams(content='Smoke', rotation=0.0)
    inputs, graph = buildFilterComplexGraph([p], [], 640, 480, 2.0, 30)
    print('fontfile:', resolveFontFile(p))
    print('graph ok:', '[0:v]null[base]' in graph)
asyncio.run(main())
"
```
Expected: prints a fontfile path and `graph ok: True`. (If the backend server was restarted since Task 0, make sure it is running again for the frontend smoke in Task 11.)

---

## Task 6: Shared `TextStyleControls` component

**Files:**
- Create: `src/components/editor/properties/textStyleControls.tsx`
- Test: `npm run typecheck`

**Context:** Both the Text tab creator (Task 7) and the properties panel (Task 10) need the same styling controls. Build one controlled component driven by `props` + an `onChange(field, value)` callback. All controls are **controlled** (not `defaultValue`) because panels stay mounted in `EditorShell` and must reflect a newly selected layer. Position X/Y sliders write the nested `position: {x, y}` object (this also fixes the properties panel's hardcoded `960/540` bug by making position editing go through these sliders instead).

- [ ] **Step 1: Verify a clean baseline**

Run (from `/home/ace/Projects/Lumora_B2/Lumora-Frontend`): `npm run typecheck`
Expected: exits 0 (no errors).

- [ ] **Step 2: Write the component**

Create `src/components/editor/properties/textStyleControls.tsx`:

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils/cn";

const FONT_FAMILIES = [
  "Inter",
  "Montserrat",
  "Source Code Pro",
  "Open Sans",
  "Liberation Sans",
  "Liberation Serif",
  "DejaVu Sans",
  "Arial",
];

const SWATCHES = [
  "#FFFFFF",
  "#000000",
  "#FF6A1A",
  "#FFFF00",
  "#FF0000",
  "#00FF00",
  "#00FFFF",
  "#FF00FF",
];

const POSITION_PRESETS: { label: string; value: { x: number; y: number } }[] = [
  { label: "Top", value: { x: 0.5, y: 0.1 } },
  { label: "Center", value: { x: 0.5, y: 0.5 } },
  { label: "Bottom", value: { x: 0.5, y: 0.9 } },
];

function posFromProps(props: Record<string, unknown>): { x: number; y: number } {
  const p = props.position;
  if (typeof p === "object" && p !== null) {
    const { x, y } = p as Record<string, number>;
    return { x: Number(x ?? 0.5), y: Number(y ?? 0.9) };
  }
  return { x: 0.5, y: 0.9 };
}

function num(props: Record<string, unknown>, key: string, fallback: number): number {
  const v = Number(props[key]);
  return Number.isFinite(v) ? v : fallback;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
      {children}
    </label>
  );
}

function Swatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const normalized = value.toLowerCase();
  return (
    <div className="flex flex-wrap gap-1.5">
      {SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Color ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            "size-5 cursor-pointer rounded-full border border-black/40 transition-transform hover:scale-110",
            normalized === color.toLowerCase() && "ring-2 ring-[var(--color-primary)]"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function TextStyleControls({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}) {
  const pos = posFromProps(props);
  const opacity = num(props, "opacity", 1);
  const rotation = num(props, "rotation", 0);
  const outlineWidth = num(props, "outlineWidth", 0);
  const outlineColor = String(props.outlineColor ?? "black");
  const shadowX = num(props, "shadowX", 0);
  const shadowY = num(props, "shadowY", 0);
  const shadowColor = String(props.shadowColor ?? "black");
  const box = Boolean(props.box);
  const boxColor = String(props.boxColor ?? "black");
  const boxBorderW = num(props, "boxBorderW", 8);

  const setPosition = (next: { x?: number; y?: number }) =>
    onChange("position", { x: next.x ?? pos.x, y: next.y ?? pos.y });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel>Font Family</FieldLabel>
        <Select
          value={String(props.fontFamily ?? "Inter")}
          onValueChange={(v) => onChange("fontFamily", v)}
        >
          <SelectTrigger className="h-8 px-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Font Size</FieldLabel>
          <input
            type="number"
            min={8}
            max={240}
            aria-label="Font Size"
            value={num(props, "size", 48)}
            onChange={(e) => onChange("size", Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1.5 text-xs text-white focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div>
          <FieldLabel>Opacity</FieldLabel>
          <div className="flex items-center gap-2 pt-1.5">
            <Slider
              aria-label="Opacity"
              value={[Math.round(opacity * 100)]}
              min={0}
              max={100}
              onValueChange={(v) => onChange("opacity", v[0] / 100)}
            />
            <span className="w-9 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Color</FieldLabel>
        <Swatches
          value={String(props.color ?? "#FFFFFF")}
          onChange={(color) => onChange("color", color)}
        />
      </div>

      <div>
        <FieldLabel>Rotation</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Rotation"
            value={[rotation]}
            min={-180}
            max={180}
            onValueChange={(v) => onChange("rotation", v[0])}
          />
          <span className="w-9 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            {rotation}°
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <FieldLabel>Background Box</FieldLabel>
          <input
            type="checkbox"
            aria-label="Background Box"
            checked={box}
            onChange={(e) => onChange("box", e.target.checked)}
            className="accent-[#FF6A1A]"
          />
        </div>
        {box && (
          <div className="mt-2 flex flex-col gap-3">
            <Swatches
              value={boxColor}
              onChange={(color) => onChange("boxColor", color)}
            />
            <div>
              <FieldLabel>Box Padding</FieldLabel>
              <Slider
                aria-label="Box Padding"
                value={[boxBorderW]}
                min={0}
                max={40}
                onValueChange={(v) => onChange("boxBorderW", v[0])}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Outline</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Outline Width"
            value={[outlineWidth]}
            min={0}
            max={10}
            onValueChange={(v) => onChange("outlineWidth", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            {outlineWidth}
          </span>
        </div>
        {outlineWidth > 0 && (
          <div className="mt-2">
            <Swatches
              value={outlineColor}
              onChange={(color) => onChange("outlineColor", color)}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Shadow</FieldLabel>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Shadow X"
            value={[shadowX]}
            min={-20}
            max={20}
            onValueChange={(v) => onChange("shadowX", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            x{shadowX}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Slider
            aria-label="Shadow Y"
            value={[shadowY]}
            min={-20}
            max={20}
            onValueChange={(v) => onChange("shadowY", v[0])}
          />
          <span className="w-6 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            y{shadowY}
          </span>
        </div>
        {(shadowX !== 0 || shadowY !== 0) && (
          <div className="mt-2">
            <Swatches
              value={shadowColor}
              onChange={(color) => onChange("shadowColor", color)}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Position</FieldLabel>
        <div className="mb-2 flex gap-1.5">
          {POSITION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPosition(preset.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-md border border-[var(--color-border)] py-1 text-[10px] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                Math.abs(pos.x - preset.value.x) < 0.01 &&
                  Math.abs(pos.y - preset.value.y) < 0.01 &&
                  "border-[var(--color-primary)] text-[var(--color-primary)]"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1.5">
          <Slider
            aria-label="Position X"
            value={[Math.round(pos.x * 100)]}
            min={0}
            max={100}
            onValueChange={(v) => setPosition({ x: v[0] / 100 })}
          />
          <span className="w-8 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            x{Math.round(pos.x * 100)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Slider
            aria-label="Position Y"
            value={[Math.round(pos.y * 100)]}
            min={0}
            max={100}
            onValueChange={(v) => setPosition({ y: v[0] / 100 })}
          />
          <span className="w-8 shrink-0 text-right text-[10px] text-[var(--color-text-muted)]">
            y{Math.round(pos.y * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0. If ESLint flags the unused `SWATCHES` import ordering or similar, run `npm run lint` and fix trivially.

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/properties/textStyleControls.tsx
git commit -m "feat: add shared text styling controls component"
```

---

## Task 7: Text tab creator

**Files:**
- Create: `src/components/editor/assets/textTab.tsx`
- Modify: `src/components/editor/assets/assetLibraryPanel.tsx:433` (mount TextTab), `:26` (import)
- Test: `npm run typecheck`

**Context:** Replace the `EmptyTab label="Text overlays coming soon"` placeholder with a creator that writes text and styles, then inserts a manual text layer at the playhead (default 5s) via the existing `addLayer` store action (no store changes needed — the text track is auto-created with `DEFAULT_TRACK_KINDS`).

- [ ] **Step 1: Write the component**

Create `src/components/editor/assets/textTab.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextStyleControls } from "@/components/editor/properties/textStyleControls";
import { toastError } from "@/lib/utils/toast";
import { useEditorStore } from "@/stores/editorStore";
import { useTimelineStore } from "@/stores/timelineStore";

const DEFAULT_PROPS: Record<string, unknown> = {
  content: "",
  fontFamily: "Inter",
  size: 48,
  color: "#FFFFFF",
  bgColor: null,
  position: { x: 0.5, y: 0.9 },
  rotation: 0,
  opacity: 1,
  box: false,
  boxColor: "#000000",
  boxBorderW: 8,
  outlineWidth: 0,
  outlineColor: "#000000",
  shadowX: 0,
  shadowY: 0,
  shadowColor: "#000000",
};

export function TextTab() {
  const timeline = useTimelineStore((s) => s.timeline);
  const addLayer = useTimelineStore((s) => s.addLayer);
  const playheadPosition = useEditorStore((s) => s.playheadPosition);
  const [props, setProps] = useState<Record<string, unknown>>(DEFAULT_PROPS);

  const content = String(props.content ?? "");

  const handleChange = (field: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    const track = timeline?.tracks.find((t) => t.type === "text");
    if (!track) {
      toastError("No text track in this timeline");
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) {
      toastError("Enter some text first");
      return;
    }
    const startMs = Math.max(0, Math.round(playheadPosition * 1000));
    addLayer(track.id, {
      id: `tmp_${Date.now()}`,
      type: "text",
      label: trimmed.slice(0, 60),
      source: "manual",
      startMs,
      durationMs: 5000,
      props: {
        ...props,
        content: trimmed,
        startTime: startMs / 1000,
        duration: 5,
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Type size={14} className="text-[var(--color-primary)]" />
          <h3 className="text-sm font-medium text-white">Add text overlay</h3>
        </div>

        <Textarea
          rows={2}
          placeholder="Your text here…"
          value={content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="mb-4 text-sm"
        />

        <TextStyleControls props={props} onChange={handleChange} />

        <Button className="mt-4 h-9 w-full text-sm" onClick={handleAdd}>
          Add to Timeline
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the asset library**

Edit `src/components/editor/assets/assetLibraryPanel.tsx`:

1. Add the import after the `AiAssistTab` import (line 26):

```tsx
import { TextTab } from "@/components/editor/assets/textTab";
```

2. Replace line 433:

```tsx
      {activeTab === "text" && <EmptyTab label="Text overlays coming soon" />}
```

with:

```tsx
      {activeTab === "text" && <TextTab />}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0. The `EmptyTab` helper is still used by the Audio tab, so it stays.

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/assets/textTab.tsx src/components/editor/assets/assetLibraryPanel.tsx
git commit -m "feat: add manual text overlay creator tab"
```

---

## Task 8: Preview text overlays

**Files:**
- Modify: `src/components/editor/previewPanel.tsx`
- Test: `npm run typecheck`

**Context:** Render every text layer active at the playhead as an absolutely-positioned `<div>` over the video. The video uses `object-contain`, so the text stage is an absolutely positioned box that exactly overlays the video element's rendered box (measured via `getBoundingClientRect` + `ResizeObserver`). Text size/outline/shadow/box-padding are scaled by `videoBoxWidth / 1920`; `left`/`top` use percentages of the stage (fractions map 1:1 to the 1920×1080 frame). Center anchoring matches the backend: `left: x%`, `top: y%`, `translate(-50%, -50%)`. Rotation applies to the element (rotates about its center = the anchor), matching the backend's center-rotate pipeline.

- [ ] **Step 1: Verify a clean baseline**

Run (from `/home/ace/Projects/Lumora_B2/Lumora-Frontend`): `npm run typecheck`
Expected: exits 0.

- [ ] **Step 2: Edit the preview panel**

Edit `src/components/editor/previewPanel.tsx`:

1. Add an `ActiveTextLayer` type and resolver after the existing `ActiveClip` type (after line 33):

```tsx
type ActiveTextLayer = {
  layer: Layer;
  trackId: string;
  startMs: number;
  durationMs: number;
};

type VideoBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function resolveActiveTextLayers(
  timeline: Timeline | null,
  playheadSec: number
): ActiveTextLayer[] {
  if (!timeline) return [];
  const t = playheadSec * 1000;
  const track = timeline.tracks.find((tr) => tr.type === "text");
  if (!track) return [];
  return track.layers
    .filter((l) => t >= l.startMs && t < l.startMs + l.durationMs)
    .map((l) => ({ layer: l, trackId: track.id, startMs: l.startMs, durationMs: l.durationMs }));
}

function posFromProps(props?: Record<string, unknown>): { x: number; y: number } {
  const p = props?.position;
  if (typeof p === "object" && p !== null) {
    const { x, y } = p as Record<string, number>;
    return { x: Number(x ?? 0.5), y: Number(y ?? 0.9) };
  }
  return { x: 0.5, y: 0.9 };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
```

2. In `PreviewPanel()`, add state and the resolver (after the existing `activeClip` memo at line 79):

```tsx
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);

  const activeTextLayers = useMemo(
    () => resolveActiveTextLayers(timeline, playheadPosition),
    [timeline, playheadPosition]
  );

  const [videoBox, setVideoBox] = useState<VideoBox | null>(null);
  const [drag, setDrag] = useState<{
    layer: Layer;
    trackId: string;
    x: number;
    y: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const [editing, setEditing] = useState<{ layer: Layer; trackId: string } | null>(null);
```

3. Add the measure effect (after the existing fullscreen effect at line 211):

```tsx
  useEffect(() => {
    const measure = () => {
      const mediaEl = mediaRef.current;
      const containerEl = containerRef.current;
      if (!mediaEl || !containerEl) return;
      const m = mediaEl.getBoundingClientRect();
      const c = containerEl.getBoundingClientRect();
      setVideoBox({
        left: m.left - c.left,
        top: m.top - c.top,
        width: m.width,
        height: m.height,
      });
    };
    const ro = new ResizeObserver(measure);
    if (mediaRef.current) ro.observe(mediaRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    measure();
    return () => ro.disconnect();
  }, [currentMediaUrl]);
```

4. Add the drag/edit handlers (after `toggleFullscreen`, before the return):

```tsx
  const scale = videoBox ? videoBox.width / 1920 : 1;

  const handleOverlayPointerDown = (
    e: React.PointerEvent,
    layer: Layer,
    trackId: string
  ) => {
    if (editing?.layer.id === layer.id) return;
    e.stopPropagation();
    selectLayer(layer.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = posFromProps(layer.props);
    setDrag({
      layer,
      trackId,
      x: pos.x,
      y: pos.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
    });
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    if (!drag || !videoBox) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    const x = clamp(drag.x + dx / videoBox.width, 0, 1);
    const y = clamp(drag.y + dy / videoBox.height, 0, 1);
    setDrag({ ...drag, x, y });
  };

  const handleOverlayPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { layer, trackId, x, y } = drag;
    setDrag(null);
    useTimelineStore.getState().updateLayerOptimistic(trackId, layer.id, {
      props: { ...layer.props, position: { x, y } },
    });
  };

  const commitEdit = (trackId: string, layer: Layer, value: string) => {
    setEditing(null);
    useTimelineStore.getState().updateLayerOptimistic(trackId, layer.id, {
      label: value.slice(0, 60) || "Text",
      props: { ...layer.props, content: value },
    });
  };
```

5. Wrap the `<video>` in a relative stage and render overlays. Replace the `{currentMedia && (<video …/>)}` block (lines 219-242) so it becomes:

```tsx
        {currentMedia && (
          <div className="relative">
            <video
              key={currentMedia.assetId}
              ref={mediaRef}
              src={currentMedia.url}
              className="block max-h-full max-w-full object-contain"
              playsInline
              preload="metadata"
              muted={muted}
              onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                const id = currentMedia.assetId;
                setMedia((m) =>
                  m && m.assetId === id ? { ...m, duration } : m
                );
                const m = mediaRef.current;
                const c = containerRef.current;
                if (m && c) {
                  const mr = m.getBoundingClientRect();
                  const cr = c.getBoundingClientRect();
                  setVideoBox({
                    left: mr.left - cr.left,
                    top: mr.top - cr.top,
                    width: mr.width,
                    height: mr.height,
                  });
                }
              }}
              onError={() => {
                setMediaError({
                  assetId: currentMedia.assetId,
                  message: "Could not load media for this clip",
                });
              }}
            />

            {videoBox && activeTextLayers.length > 0 && (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: videoBox.left,
                  top: videoBox.top,
                  width: videoBox.width,
                  height: videoBox.height,
                }}
              >
                {activeTextLayers.map(({ layer, trackId }) => {
                  const pos = posFromProps(layer.props);
                  const isEditing = editing?.layer.id === layer.id;
                  const live = drag && drag.layer.id === layer.id
                    ? { x: drag.x, y: drag.y }
                    : pos;
                  const content = String(layer.props?.content ?? "");
                  const size = Number(layer.props?.size ?? 48);
                  const opacity = Number(layer.props?.opacity ?? 1);
                  const rotation = Number(layer.props?.rotation ?? 0);
                  const outlineWidth = Number(layer.props?.outlineWidth ?? 0);
                  const outlineColor = String(layer.props?.outlineColor ?? "black");
                  const shadowX = Number(layer.props?.shadowX ?? 0);
                  const shadowY = Number(layer.props?.shadowY ?? 0);
                  const shadowColor = String(layer.props?.shadowColor ?? "black");
                  const box = Boolean(layer.props?.box);
                  const boxColor = String(layer.props?.boxColor ?? "black");
                  const boxBorderW = Number(layer.props?.boxBorderW ?? 8);
                  const selected = selectedLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      className="pointer-events-auto absolute cursor-move select-none"
                      style={{
                        left: `${live.x * 100}%`,
                        top: `${live.y * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        fontSize: `${(size * scale).toFixed(1)}px`,
                        lineHeight: 1.2,
                        color: String(layer.props?.color ?? "#FFFFFF"),
                        whiteSpace: "pre",
                        opacity,
                        WebkitTextStroke:
                          outlineWidth > 0
                            ? `${outlineWidth * scale}px ${outlineColor}`
                            : undefined,
                        textShadow:
                          shadowX !== 0 || shadowY !== 0
                            ? `${shadowX * scale}px ${shadowY * scale}px 0 ${shadowColor}`
                            : undefined,
                        backgroundColor: box ? boxColor : undefined,
                        padding: box ? `${boxBorderW * scale}px` : undefined,
                        outline: selected ? "1px dashed #FF6A1A" : undefined,
                        outlineOffset: "2px",
                      }}
                      onPointerDown={(e) =>
                        handleOverlayPointerDown(e, layer, trackId)
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onDoubleClick={() => setEditing({ layer, trackId })}
                    >
                      {isEditing ? (
                        <textarea
                          autoFocus
                          defaultValue={content}
                          onBlur={(e) =>
                            commitEdit(trackId, layer, e.currentTarget.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                            if (e.key === "Escape") {
                              e.currentTarget.value = content;
                              e.currentTarget.blur();
                            }
                          }}
                          className="min-w-[160px] resize-none bg-transparent text-center focus:outline-none"
                          style={{ color: "inherit", font: "inherit", lineHeight: 1.2 }}
                        />
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
```

**Note:** `useTimelineStore` is already imported in this file (line 18). The stage div has no sizing constraints, so the video keeps its existing `max-h-full max-w-full object-contain` behavior; the overlays are positioned over the measured video box regardless of letterboxing.

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0. (`React.PointerEvent` requires `React` types — the file already imports React hooks from `"react"`; add `import type React from "react";` at the top if `React` is not in scope for the type annotations.)

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/previewPanel.tsx
git commit -m "feat: render and select text overlays on the live preview"
```

---

## Task 9: (folded into Task 8 — drag and inline edit are implemented in the same edit)

See Task 8 Step 2 items 4–5 for `handleOverlayPointerDown/Move/Up` and the inline `textarea` editor. No separate task.

---

## Task 10: Properties panel text section

**Files:**
- Modify: `src/components/editor/properties/layerPropertiesPanel.tsx:210-243`
- Test: `npm run typecheck`

**Context:** Reuse `TextStyleControls` for the selected text layer. Make the Content `Textarea` controlled so it resets when switching layers. This also removes the hardcoded `Position X = 960` / `Position Y = 540` `NumberField`s, which wrote bogus `positionx`/`positiony` props.

- [ ] **Step 1: Edit the panel**

Edit `src/components/editor/properties/layerPropertiesPanel.tsx`:

1. Add the import (after the `Textarea` import at line 7):

```tsx
import { TextStyleControls } from "@/components/editor/properties/textStyleControls";
```

2. Replace the `{selected.layer.type === "text" && (…)}` block (lines 210-243) with:

```tsx
            {selected.layer.type === "text" && (
              <div className="flex flex-col gap-5">
                <div>
                  <FieldLabel>Content</FieldLabel>
                  <Textarea
                    rows={3}
                    value={String(selected.layer.props?.content ?? "")}
                    onChange={(e) => onUpdate("content", e.target.value)}
                  />
                </div>
                <TextStyleControls
                  props={selected.layer.props ?? {}}
                  onChange={(field, value) => onUpdate(field, value)}
                />
              </div>
            )}
```

**Note:** `onUpdate` → `updateField`'s `default` case writes `patch.props = { ...layer.props, [field]: value }`, which is exactly right for every field `TextStyleControls` emits (`fontFamily`, `size`, `color`, `opacity`, `rotation`, `box`, `boxColor`, `boxBorderW`, `outlineWidth`, `outlineColor`, `shadowX`, `shadowY`, `shadowColor`, `position`, `content`). The old `case "fontSize"` in `updateField` becomes dead but harmless — leave it.

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/properties/layerPropertiesPanel.tsx
git commit -m "feat: full text styling controls in properties panel, fix position binding"
```

---

## Task 11: Frontend end-to-end smoke + final verification

**Files:** none (verification only)

- [ ] **Step 1: Full frontend checks**

Run (from `/home/ace/Projects/Lumora_B2/Lumora-Frontend`): `npm run lint && npm run typecheck`
Expected: both exit 0.

- [ ] **Step 2: Manual smoke (both servers running on :3002 / :8001)**

1. Open `http://localhost:3002`, create/open a project, and import a short video.
2. Go to the **Text** tab, type "Hello World", pick a font/color, enable the background box, set rotation to 15, click **Add to Timeline**.
3. In the **Timeline**, click the new text chip; confirm the **Properties** panel shows the text section with all styling controls and that changing Font Size / Rotation / Position updates the chip.
4. In the **Preview**: the text appears over the video at the chosen position. Drag it — it follows the cursor and persists (check a network PATCH fired on release). Double-click it, edit the text, press Enter — the overlay updates.
5. Scrub the playhead before and after the text layer's 5s window — the overlay appears/disappears correctly.
6. Export the project; download and play the render. Confirm the text is present, rotated, styled, and that non-rotated video still plays normally.

- [ ] **Step 3: Confirm both repos are clean of stray files**

Run: `git status` in `/home/ace/Projects/Lumora_B2/Lumora` and `/home/ace/Projects/Lumora_B2/Lumora-Frontend`
Expected: only the intended committed changes and the pre-existing unrelated changes (`.env.example`, `AGENTS.md`, `ai/` files, README, context/, package files). Do not commit those unrelated files.

---

## Self-Review

- **Spec coverage:** manual creation (Task 7) ✓; rich styling (Tasks 1, 3, 6, 10) ✓; live preview (Task 8) ✓; drag (Task 8) ✓; in-canvas edit (Task 8) ✓; export correctness (Tasks 3–5) ✓; render bug fix (Task 1) ✓.
- **Type consistency:** `content` field + alias defined in Task 1 and used by Task 3's tests; `fontFamily`/`rotation`/`opacity`/`box`/`boxColor`/`boxBorderW`/`outlineWidth`/`outlineColor`/`shadowX`/`shadowY`/`shadowColor` are the single source of truth across `TextParams`, `TextStyleControls`, `TextTab`, preview, and properties panel. `buildFilterComplexGraph` signature matches its single caller `_applyVideoFiltersComplex`. `resolveFontFile` is defined in Task 2 and used in Task 3.
- **Known accepted limits:** preview is near-WYSIWYG (browser font availability and `-webkit-text-stroke` vs ffmpeg `borderw` differ slightly); text wraps only on explicit `\n` in both paths; the complex render path is only used when a text layer has `rotation != 0`.
