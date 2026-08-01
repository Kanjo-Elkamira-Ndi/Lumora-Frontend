import { AssetLibraryPanel } from "./assetLibraryPanel";
import { EditorTopbar } from "./editorTopbar";
import { LayerPropertiesPanel } from "./layerPropertiesPanel";
import { PreviewPanel } from "./previewPanel";
import { TimelinePanel } from "./timelinePanel";

export function EditorShell() {
  return (
    <div className="grid h-screen grid-rows-[56px_1fr_220px] overflow-hidden bg-[var(--color-neutral)] text-[var(--color-text-primary)]">
      <EditorTopbar />
      <div className="grid min-h-0 grid-cols-[280px_1fr_300px]">
        <AssetLibraryPanel />
        <PreviewPanel />
        <LayerPropertiesPanel />
      </div>
      <TimelinePanel />
    </div>
  );
}
