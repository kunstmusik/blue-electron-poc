import { useRef, useCallback, useState, useEffect } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Check } from "lucide-react";
import { useProjectStore } from "../../../stores/project-store";
import type {
  ScoreDocumentSnapshot,
  ScoreLayerGroupSnapshot,
  ScoreLayerSnapshot,
  ScoreObjectLocationRef,
  PolyObjectLayerGroupSnapshot,
} from "./score/types";
import type { SnapValueName } from "@blue/data";
import type { RulerConfigChanges } from "./score/RulerConfigDialog";
import SplitPane from "./orchestra/SplitPane";
import ScoreToolbar from "./score/ScoreToolbar";
import RulerConfigDialog from "./score/RulerConfigDialog";
import ColumnHeader from "./score/ColumnHeader";
import LayerPanel from "./score/LayerPanel";
import { useScorePathState } from "./score/useScorePathState";
import { useScoreSelectionStore } from "../../../stores/score-selection-store";

type ScoreMode = "score" | "singleLine" | "multiLine";

const GROUP_SPACER = 36;

export default function ScorePanel() {
  const loaded = useProjectStore((s) => s.loaded);
  const score = useProjectStore((s) => s.score);
  const sessionId = useProjectStore((s) => s.sessionId);
  const transport = useProjectStore((s) => s.transport);
  const lastScorePatch = useProjectStore((s) => s.lastScorePatch);
  const flushPendingPatches = useProjectStore((s) => s.flushPendingPatches);

  const [mode, setMode] = useState<ScoreMode>("score");
  const [snapEnabled, setSnapEnabled] = useState(score.timeState.snapEnabled);
  const [snapValue, setSnapValue] = useState<SnapValueName>(
    score.timeState.snapValue as SnapValueName,
  );
  const [rulerDialogOpen, setRulerDialogOpen] = useState(false);

  const [timeState, setTimeState] = useState(score.timeState);

  const {
    session,
    scrollContainerRef,
    navigateToGroup,
    navigateToRoot,
    navigateToSegment,
    resetSession,
  } = useScorePathState();

  useEffect(() => {
    useScoreSelectionStore.getState().clearSelection();
  }, [session.activeGroupId]);

  useEffect(() => {
    setTimeState(score.timeState);
    setSnapEnabled(score.timeState.snapEnabled);
    setSnapValue(score.timeState.snapValue as SnapValueName);
  }, [score.timeState]);

  useEffect(() => {
    resetSession();
  }, [sessionId, resetSession]);

  const leftHeaderRef = useRef<HTMLDivElement>(null);
  const [nestedSnapshot, setNestedSnapshot] = useState<PolyObjectLayerGroupSnapshot | null>(null);

  const activeSegment = session.segments[session.segments.length - 1];

  useEffect(() => {
    const activeGroupId = activeSegment?.groupId;
    const activeLocation = activeSegment?.location;

    if (!activeGroupId || !activeLocation) {
      setNestedSnapshot(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await flushPendingPatches();
        const snap = await window.blueAPI.getNestedPolyObjectSnapshot(activeLocation);
        if (!cancelled) {
          setNestedSnapshot(snap);
        }
      } catch {
        if (!cancelled) {
          setNestedSnapshot(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSegment?.groupId, activeSegment?.location, lastScorePatch, flushPendingPatches]);

  const effectiveLayerGroups: ScoreLayerGroupSnapshot[] =
    session.activeGroupId && nestedSnapshot
      ? [nestedSnapshot]
      : score.layerGroups;

  const pixelsPerBeat = computePixelsPerBeat(timeState.zoomIterations);
  const totalBeats = computeTotalBeats(score);

  const handleTimelineScroll = useCallback(() => {
    const timeline = scrollContainerRef.current;
    const left = leftHeaderRef.current;
    if (timeline && left) {
      left.scrollTop = timeline.scrollTop;
    }
  }, [scrollContainerRef]);

  const handleLeftHeaderScroll = useCallback(() => {
    const timeline = scrollContainerRef.current;
    const left = leftHeaderRef.current;
    if (timeline && left) {
      timeline.scrollTop = left.scrollTop;
    }
  }, [scrollContainerRef]);

  const handleRulerConfigApply = useCallback((changes: RulerConfigChanges) => {
    setTimeState((prev) => ({
      ...prev,
      primaryTimeDisplay: changes.primaryTimeDisplay,
      secondaryRulerEnabled: changes.secondaryRulerEnabled,
      secondaryTimeDisplay: changes.secondaryTimeDisplay,
      smpteFrameRate: changes.smpteFrameRate,
    }));
    useProjectStore.getState().applyProjectDocumentPatch({
      score: {
        type: 'updateTimeState',
        patch: {
          primaryTimeDisplay: changes.primaryTimeDisplay,
          secondaryRulerEnabled: changes.secondaryRulerEnabled,
          secondaryTimeDisplay: changes.secondaryTimeDisplay,
          smpteFrameRate: changes.smpteFrameRate,
          scoreObjectUpdateMode: changes.scoreObjectUpdateMode,
          markerUpdateMode: changes.markerUpdateMode,
        },
      },
    });
  }, []);

  const handleRowVisibilityChange = useCallback((key: RowVisibilityKey, value: boolean) => {
    setTimeState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTempoEnabledChange = useCallback((enabled: boolean) => {
    useProjectStore.getState().applyPatchToDocument({ transport: { tempoMap: { enabled } } });
  }, []);

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center text-blue-muted text-sm">
        No project loaded
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#1a1a2e] text-blue-text">
      <ScoreToolbar
        mode={mode}
        onModeChange={setMode}
        pathSegments={session.segments}
        onNavigateToSegment={navigateToSegment}
        onNavigateToRoot={navigateToRoot}
        snapEnabled={snapEnabled}
        snapValue={snapValue}
        onSnapToggle={setSnapEnabled}
        onSnapValueChange={setSnapValue}
        onRulerConfig={() => setRulerDialogOpen(true)}
      />

      <SplitPane
        ariaLabel="Resize score layer headers and timeline"
        className="flex-1 min-h-0 bg-black"
        firstClassName="min-h-0"
        secondClassName="min-w-0"
        initialSplit={0.19}
        minFirstSize={80}
        minSecondSize={200}
        orientation="horizontal"
        first={
          <LeftPanel
            timeState={timeState}
            tempoMapEnabled={transport.tempoMap.enabled}
            onTempoEnabledChange={handleTempoEnabledChange}
            onRowVisibilityChange={handleRowVisibilityChange}
            layerGroups={effectiveLayerGroups}
            leftHeaderRef={leftHeaderRef}
            onLeftScroll={handleLeftHeaderScroll}
          />
        }
        second={
          <div
            ref={scrollContainerRef}
            className="h-full overflow-auto"
            onScroll={handleTimelineScroll}
          >
            <ColumnHeader
              timeState={timeState}
              markers={score.markers}
              meters={transport.meterMap.entries}
              tempoMap={transport.tempoMap}
              totalBeats={totalBeats}
              pixelsPerBeat={pixelsPerBeat}
            />
            <LayerPanel
              layerGroups={effectiveLayerGroups}
              onOpenNested={navigateToGroup}
              pixelsPerBeat={pixelsPerBeat}
              totalBeats={totalBeats}
              snapEnabled={snapEnabled}
              snapValue={snapValue}
              tempo={
                transport.tempoMap.points.length > 0
                  ? transport.tempoMap.points[0].tempo
                  : 60
              }
              smpteFrameRate={timeState.smpteFrameRate || 24}
            />
          </div>
        }
      />

      {rulerDialogOpen && (
        <RulerConfigDialog
          timeState={timeState}
          onApply={handleRulerConfigApply}
          onClose={() => setRulerDialogOpen(false)}
        />
      )}
    </div>
  );
}

interface LeftPanelProps {
  timeState: ScoreDocumentSnapshot["timeState"];
  tempoMapEnabled: boolean;
  onTempoEnabledChange: (enabled: boolean) => void;
  onRowVisibilityChange: (key: 'tempoRowVisible' | 'meterRowVisible' | 'markersRowVisible', value: boolean) => void;
  layerGroups: ScoreLayerGroupSnapshot[];
  leftHeaderRef: React.RefObject<HTMLDivElement | null>;
  onLeftScroll: () => void;
}

function LeftPanel({
  timeState,
  tempoMapEnabled,
  onTempoEnabledChange,
  onRowVisibilityChange,
  layerGroups,
  leftHeaderRef,
  onLeftScroll,
}: LeftPanelProps) {
  const visibleGroups = layerGroups;

  return (
    <div className="h-full flex flex-col bg-blue-surface border-r border-blue-border/40">
      <div className="flex-shrink-0 flex flex-col">
        {timeState.tempoRowVisible && (
          <RowHeader onContextMenu={onRowVisibilityChange} rowVisibility={timeState}>
            <label className="flex items-center gap-0.5 text-[9px] text-blue-muted cursor-pointer select-none">
              <input type="checkbox" className="w-2.5 h-2.5" checked={tempoMapEnabled} onChange={(e) => onTempoEnabledChange(e.target.checked)} />
              Use Tempo
            </label>
            <button
              className="w-3.5 h-3.5 text-[8px] text-blue-muted hover:text-blue-text flex items-center justify-center"
              title="Toggle tempo editor"
            >
              &#9660;
            </button>
          </RowHeader>
        )}
        {timeState.meterRowVisible && (
          <RowHeader onContextMenu={onRowVisibilityChange} borderLeft rowVisibility={timeState}>
            <span className="text-[9px] text-blue-muted">Time Signature</span>
          </RowHeader>
        )}
        {timeState.markersRowVisible && (
          <RowHeader onContextMenu={onRowVisibilityChange} borderLeft rowVisibility={timeState}>
            <span className="text-[9px] text-blue-muted">Markers</span>
          </RowHeader>
        )}
        <RowHeader onContextMenu={onRowVisibilityChange} center rowVisibility={timeState}>
          <button className="text-[9px] text-blue-muted hover:text-blue-text px-2 py-0 border border-blue-border/30 rounded-sm bg-blue-surface/50 hover:bg-blue-surface">
            Manage
          </button>
        </RowHeader>
        {timeState.secondaryRulerEnabled && (
          <div className="h-5 border-b border-blue-border/20 bg-blue-surface/30" />
        )}
      </div>

      <div
        ref={leftHeaderRef}
        className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={onLeftScroll}
      >
        {visibleGroups.map((group, gi) => {
          const spacer = (
            <SpacerPanel
              key={`spacer-${group.groupId}`}
              groupId={group.groupId}
              groupIndex={gi}
              totalGroups={visibleGroups.length}
              layerCount={group.layers.length}
            />
          );

          return (
            <div key={group.groupId}>
              {group.layers.map((layer, li) => (
                <SoundLayerHeader
                  key={layer.layerId}
                  layer={layer}
                  groupId={group.groupId}
                  layerIndex={li}
                />
              ))}
              {spacer}
            </div>
          );
        })}
      </div>

    </div>
  );
}

type RowVisibilityKey = 'tempoRowVisible' | 'meterRowVisible' | 'markersRowVisible';

function RowHeader({
  onContextMenu,
  borderLeft,
  center,
  children,
  rowVisibility,
}: {
  onContextMenu: (key: RowVisibilityKey, value: boolean) => void;
  borderLeft?: boolean;
  center?: boolean;
  children: React.ReactNode;
  rowVisibility: { tempoRowVisible: boolean; meterRowVisible: boolean; markersRowVisible: boolean };
}) {
  const ctxItemClass =
    "px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)] flex items-center gap-2";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className={`h-5 border-b border-blue-border/20 flex items-center ${center ? 'justify-center' : 'justify-end pr-2'} bg-blue-surface/30 ${borderLeft ? 'border-l-2 border-l-blue-border/30' : !center ? 'gap-1' : ''}`}
        >
          {children}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-[#1e293b] border border-blue-border/50 rounded-md p-1 shadow-xl z-50">
          <ContextMenu.CheckboxItem
            className={ctxItemClass}
            checked={rowVisibility.tempoRowVisible}
            onCheckedChange={(checked) => onContextMenu('tempoRowVisible', checked === true)}
            onPointerDown={(e) => e.preventDefault()}
          >
            <ContextMenu.ItemIndicator className="flex items-center justify-center w-4">
              <Check size={12} strokeWidth={2.5} />
            </ContextMenu.ItemIndicator>
            Show Tempo Row
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            className={ctxItemClass}
            checked={rowVisibility.meterRowVisible}
            onCheckedChange={(checked) => onContextMenu('meterRowVisible', checked === true)}
            onPointerDown={(e) => e.preventDefault()}
          >
            <ContextMenu.ItemIndicator className="flex items-center justify-center w-4">
              <Check size={12} strokeWidth={2.5} />
            </ContextMenu.ItemIndicator>
            Show Meter Row
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            className={ctxItemClass}
            checked={rowVisibility.markersRowVisible}
            onCheckedChange={(checked) => onContextMenu('markersRowVisible', checked === true)}
            onPointerDown={(e) => e.preventDefault()}
          >
            <ContextMenu.ItemIndicator className="flex items-center justify-center w-4">
              <Check size={12} strokeWidth={2.5} />
            </ContextMenu.ItemIndicator>
            Show Markers Row
          </ContextMenu.CheckboxItem>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function SpacerPanel({
  groupId,
  groupIndex,
  totalGroups,
  layerCount,
}: {
  groupId: string;
  groupIndex: number;
  totalGroups: number;
  layerCount: number;
}) {
  const addLayer = useProjectStore((s) => s.addLayer);
  const ctxItemClass =
    "px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="group relative flex items-center justify-center border-b border-blue-border/10 bg-blue-surface/10 hover:bg-blue-surface/30 cursor-pointer"
          style={{ height: GROUP_SPACER }}
          onDoubleClick={() => addLayer(groupId, layerCount - 1)}
        >
          <span className="text-[14px] text-blue-muted opacity-0 group-hover:opacity-60 select-none">
            +
          </span>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerCount - 1)}
          >
            Add Layer
          </ContextMenu.Item>
          {groupIndex > 0 && (
            <ContextMenu.Item
              className={ctxItemClass}
              onSelect={() => alert("Not yet implemented")}
            >
              Move Layer Group Up
            </ContextMenu.Item>
          )}
          {groupIndex < totalGroups - 1 && (
            <ContextMenu.Item
              className={ctxItemClass}
              onSelect={() => alert("Not yet implemented")}
            >
              Move Layer Group Down
            </ContextMenu.Item>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function SoundLayerHeader({
  layer,
  groupId,
  layerIndex,
}: {
  layer: ScoreLayerSnapshot;
  groupId: string;
  layerIndex: number;
}) {
  const setLayerMute = useProjectStore((s) => s.setLayerMute);
  const setLayerSolo = useProjectStore((s) => s.setLayerSolo);
  const renameLayer = useProjectStore((s) => s.renameLayer);
  const setLayerHeight = useProjectStore((s) => s.setLayerHeight);
  const addLayer = useProjectStore((s) => s.addLayer);
  const removeLayer = useProjectStore((s) => s.removeLayer);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const height = layer.height || 44;
  const heightIndex = Math.round(height / 22) - 1;

  const commitEdit = useCallback(() => {
    setEditing(false);
    if (editValue.trim() && editValue !== layer.name) {
      renameLayer(layer.layerId, editValue.trim());
    }
  }, [layer.layerId, layer.name, editValue, renameLayer]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditValue(layer.name);
  }, [layer.name]);

  const startEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(layer.name);
      setEditing(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [layer.name],
  );

  const btnClass = (active: boolean, activeBg: string) =>
    `w-5 h-4 text-[10px] font-bold rounded-sm border border-blue-border/30 flex items-center justify-center ${active ? activeBg + " text-black" : "bg-transparent text-blue-muted hover:text-blue-text"}`;

  const ctxItemClass =
    "px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="flex items-start border-b border-[#2a2a2a] overflow-hidden select-none"
          style={{ height }}
          onDoubleClick={startEdit}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="flex-1 min-w-0 px-1 text-[11px] bg-blue-surface/60 text-blue-text outline-none border border-blue-accent/40 rounded-sm mx-1 mt-0.5"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              onBlur={commitEdit}
            />
          ) : (
            <span className="flex-1 min-w-0 px-1.5 text-[11px] text-blue-text truncate pointer-events-none leading-4 mt-0.5">
              {layer.name}
            </span>
          )}
          <div className="shrink-0 flex items-start gap-px mr-1 pt-0.5">
            <button
              className={btnClass(!!layer.muted, "bg-[#b28c00]")}
              title="Mute"
              onClick={(e) => {
                e.stopPropagation();
                setLayerMute(layer.layerId, !layer.muted);
              }}
            >
              M
            </button>
            <button
              className={btnClass(!!layer.solo, "bg-[#00b200]")}
              title="Solo"
              style={layer.solo ? { color: "#fff" } : {}}
              onClick={(e) => {
                e.stopPropagation();
                setLayerSolo(layer.layerId, !layer.solo);
              }}
            >
              S
            </button>
            <button
              className={btnClass(false, "")}
              title="Note Processors"
              onClick={(e) => {
                e.stopPropagation();
                alert("Not yet implemented");
              }}
            >
              N
            </button>
            <button
              className={btnClass(false, "")}
              title="Automation"
              onClick={(e) => {
                e.stopPropagation();
                alert("Not yet implemented");
              }}
            >
              A
            </button>
          </div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerIndex - 1)}
          >
            Add Layer Above
          </ContextMenu.Item>
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerIndex)}
          >
            Add Layer Below
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-blue-border/30 my-1" />
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => removeLayer(groupId, layerIndex)}
          >
            Remove Layer
          </ContextMenu.Item>
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => alert("Not yet implemented")}
          >
            Push Up
          </ContextMenu.Item>
          <ContextMenu.Item
            className={ctxItemClass}
            onSelect={() => alert("Not yet implemented")}
          >
            Push Down
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-blue-border/30 my-1" />
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger
              className={`flex items-center justify-between ${ctxItemClass}`}
            >
              Layer Height
              <span className="text-[10px] opacity-60 ml-2">▸</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="min-w-[120px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                  <ContextMenu.Item
                    key={idx}
                    className={`${ctxItemClass} ${heightIndex === idx - 1 ? "bg-blue-accent/20 font-medium" : ""}`}
                    onSelect={() => setLayerHeight(layer.layerId, idx - 1)}
                  >
                    {idx}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function computePixelsPerBeat(zoomIterations: number): number {
  const pixelSecond = 100 * Math.exp(Math.log(2) * (zoomIterations / 32.0));
  return Math.max(10, Math.min(pixelSecond, 2000));
}

function computeTotalBeats(score: ScoreDocumentSnapshot): number {
  let maxBeat = 64;
  for (const lg of score.layerGroups) {
    for (const layer of lg.layers) {
      for (const item of layer.items) {
        maxBeat = Math.max(maxBeat, item.startBeats + item.durationBeats);
      }
    }
  }
  return maxBeat + 16;
}
