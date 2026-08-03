import { AssetLibraryPanel } from "./assets/assetLibraryPanel";
import { EditorTopbar } from "./editorTopbar";
import { ExportProgressCard } from "./export/exportProgressCard";
import { PanelResizer } from "./layout/panelResizer";
import { LayerPropertiesPanel } from "./properties/layerPropertiesPanel";
import { PreviewPanel } from "./previewPanel";
import { TimelinePanel } from "./timelinePanel";
import { useLayoutStore } from "@/stores/layoutStore";

export function EditorShell() {
  const leftWidth = useLayoutStore((s) => s.leftWidth);
  const rightWidth = useLayoutStore((s) => s.rightWidth);
  const timelineHeight = useLayoutStore((s) => s.timelineHeight);
  const resizeLeft = useLayoutStore((s) => s.resizeLeft);
  const resizeRight = useLayoutStore((s) => s.resizeRight);
  const resizeTimeline = useLayoutStore((s) => s.resizeTimeline);

  return (
    <div
      className="grid h-screen grid-cols-[minmax(0,1fr)] overflow-hidden bg-[var(--color-neutral)] text-[var(--color-text-primary)]"
      style={{
        gridTemplateRows: `56px 1fr auto ${timelineHeight}px`,
      }}
    >
      <EditorTopbar />
      <div
        className="grid min-h-0"
        style={{
          gridTemplateColumns: `${leftWidth}px minmax(0, 1fr) ${rightWidth}px`,
        }}
      >
        <AssetLibraryPanel />
        <PanelResizer
          axis="vertical"
          ariaLabel="Resize asset library panel"
          onResize={resizeLeft}
        />
        <PreviewPanel />
        <PanelResizer
          axis="vertical"
          ariaLabel="Resize properties panel"
          onResize={(delta) => resizeRight(-delta)}
        />
        <LayerPropertiesPanel />
      </div>
      <PanelResizer
        axis="horizontal"
        ariaLabel="Resize timeline panel"
        onResize={resizeTimeline}
      />
      <TimelinePanel />
      <ExportProgressCard />
    </div>
  );
}
