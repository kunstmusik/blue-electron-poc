import { useRef, useCallback, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useProjectStore } from '../../../stores/project-store';
import type { ScoreDocumentSnapshot, ScoreLayerGroupSnapshot, ScoreLayerSnapshot } from './score/types';
import type { SnapValueName } from '@blue/data';
import type { RulerConfigChanges } from './score/RulerConfigDialog';
import SplitPane from './orchestra/SplitPane';
import ScoreToolbar from './score/ScoreToolbar';
import RulerConfigDialog from './score/RulerConfigDialog';
import ColumnHeader from './score/ColumnHeader';
import LayerPanel from './score/LayerPanel';
import { useScorePathState } from './score/useScorePathState';

type ScoreMode = 'score' | 'singleLine' | 'multiLine';

const GROUP_SPACER = 36;

export default function ScorePanel() {
  const loaded = useProjectStore((s) => s.loaded);
  const score = useProjectStore((s) => s.score);
  const transport = useProjectStore((s) => s.transport);

  const [mode, setMode] = useState<ScoreMode>('score');
  const [snapEnabled, setSnapEnabled] = useState(score.timeState.snapEnabled);
  const [snapValue, setSnapValue] = useState<SnapValueName>(score.timeState.snapValue as SnapValueName);
  const [rulerDialogOpen, setRulerDialogOpen] = useState(false);

  const [timeState, setTimeState] = useState(score.timeState);

  const {
    session,
    scrollContainerRef,
    navigateToGroup,
    navigateToRoot,
    navigateToSegment,
  } = useScorePathState();

  const leftHeaderRef = useRef<HTMLDivElement>(null);

  const pixelsPerBeat = computePixelsPerBeat(timeState.zoomIterations);
  const totalBeats = computeTotalBeats(score);

  const handleTimelineScroll = useCallback(() => {
    const timeline = scrollContainerRef.current;
    const left = leftHeaderRef.current;
    if (timeline && left) {
      left.scrollTop = timeline.scrollTop;
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
  }, []);

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center text-blue-muted text-sm">
        No project loaded
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-blue-bg text-blue-text">
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
        className="flex-1 min-h-0"
        firstClassName="min-h-0"
        secondClassName="min-w-0"
        initialSplit={0.19}
        minFirstSize={80}
        minSecondSize={200}
        orientation="horizontal"
        first={
          <LeftPanel
            timeState={timeState}
            layerGroups={score.layerGroups}
            activeGroupId={session.activeGroupId}
            leftHeaderRef={leftHeaderRef}
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
              layerGroups={score.layerGroups}
              activeGroupId={session.activeGroupId}
              onOpenNested={navigateToGroup}
              pixelsPerBeat={pixelsPerBeat}
              totalBeats={totalBeats}
              snapEnabled={snapEnabled}
              snapValue={snapValue}
              tempo={transport.tempoMap.points.length > 0 ? transport.tempoMap.points[0].tempo : 60}
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
  timeState: ScoreDocumentSnapshot['timeState'];
  layerGroups: ScoreLayerGroupSnapshot[];
  activeGroupId: string | null;
  leftHeaderRef: React.RefObject<HTMLDivElement | null>;
}

function LeftPanel({ timeState, layerGroups, activeGroupId, leftHeaderRef }: LeftPanelProps) {
  const visibleGroups = activeGroupId === null
    ? layerGroups
    : layerGroups.filter((g) => g.groupId === activeGroupId);

  return (
    <div className="h-full flex flex-col bg-blue-surface/20 border-r border-blue-border/40">
      <div className="flex-shrink-0 flex flex-col">
        {timeState.tempoRowVisible && (
          <div className="h-5 border-b border-blue-border/20 flex items-center justify-end pr-2 gap-1 bg-blue-surface/30">
            <label className="flex items-center gap-0.5 text-[9px] text-blue-muted cursor-pointer select-none">
              <input type="checkbox" className="w-2.5 h-2.5" defaultChecked />
              Use Tempo
            </label>
            <button className="w-3.5 h-3.5 text-[8px] text-blue-muted hover:text-blue-text flex items-center justify-center" title="Toggle tempo editor">&#9660;</button>
          </div>
        )}
        {timeState.meterRowVisible && (
          <div className="h-5 border-b border-blue-border/20 flex items-center justify-end pr-2 text-[9px] text-blue-muted bg-blue-surface/30 border-l-2 border-l-blue-border/30">
            Time Signature
          </div>
        )}
        {timeState.markersRowVisible && (
          <div className="h-5 border-b border-blue-border/20 flex items-center justify-end pr-2 text-[9px] text-blue-muted bg-blue-surface/30 border-l-2 border-l-blue-border/30">
            Markers
          </div>
        )}
        <div className="h-5 border-b border-blue-border/20 flex items-center justify-center bg-blue-surface/30">
          <button className="text-[9px] text-blue-muted hover:text-blue-text px-2 py-0 border border-blue-border/30 rounded-sm bg-blue-surface/50 hover:bg-blue-surface">
            Manage
          </button>
        </div>
        {timeState.secondaryRulerEnabled && (
          <div className="h-5 border-b border-blue-border/20 bg-blue-surface/30" />
        )}
      </div>

      <div ref={leftHeaderRef} className="flex-1 min-h-0 overflow-hidden">
        {visibleGroups.map((group, gi) => {
          const spacer = gi < visibleGroups.length - 1 ? (
            <SpacerPanel key={`spacer-${group.groupId}`} groupId={group.groupId} groupIndex={gi} totalGroups={visibleGroups.length} layerCount={group.layers.length} />
          ) : null;

          return (
            <div key={group.groupId}>
              {group.layers.map((layer, li) => (
                <SoundLayerHeader key={layer.layerId} layer={layer} groupId={group.groupId} layerIndex={li} />
              ))}
              {spacer}
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 h-3.5 border-t border-blue-border/20" />
    </div>
  );
}

function SpacerPanel({ groupId, groupIndex, totalGroups, layerCount }: { groupId: string; groupIndex: number; totalGroups: number; layerCount: number }) {
  const addLayer = useProjectStore((s) => s.addLayer);
  const ctxItemClass = 'px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]';

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="group relative flex items-center justify-center border-b border-blue-border/10 bg-blue-surface/10 hover:bg-blue-surface/30 cursor-pointer"
          style={{ height: GROUP_SPACER }}
          onDoubleClick={() => addLayer(groupId, layerCount - 1)}
        >
          <span className="text-[14px] text-blue-muted opacity-0 group-hover:opacity-60 select-none">+</span>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
          <ContextMenu.Item className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerCount - 1)}>
            Add Layer
          </ContextMenu.Item>
          {groupIndex > 0 && (
            <ContextMenu.Item className={ctxItemClass} onSelect={() => alert('Not yet implemented')}>
              Move Layer Group Up
            </ContextMenu.Item>
          )}
          {groupIndex < totalGroups - 1 && (
            <ContextMenu.Item className={ctxItemClass} onSelect={() => alert('Not yet implemented')}>
              Move Layer Group Down
            </ContextMenu.Item>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function SoundLayerHeader({ layer, groupId, layerIndex }: { layer: ScoreLayerSnapshot; groupId: string; layerIndex: number }) {
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

  const startEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(layer.name);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [layer.name]);

  const btnClass = (active: boolean, activeBg: string) =>
    `w-5 h-4 text-[10px] font-bold rounded-sm border border-blue-border/30 flex items-center justify-center ${active ? activeBg + ' text-black' : 'bg-transparent text-blue-muted hover:text-blue-text'}`;

  const ctxItemClass = 'px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]';

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="flex items-start border-b border-blue-border/15 overflow-hidden select-none"
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
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              onBlur={commitEdit}
            />
          ) : (
            <span className="flex-1 min-w-0 px-1.5 text-[11px] text-blue-text truncate pointer-events-none leading-4 mt-0.5">
              {layer.name}
            </span>
          )}
          <div className="flex-shrink-0 flex items-start gap-px mr-1 pt-0.5">
            <button className={btnClass(!!layer.muted, 'bg-[#b28c00]')} title="Mute"
              onClick={(e) => { e.stopPropagation(); setLayerMute(layer.layerId, !layer.muted); }}>M</button>
            <button className={btnClass(!!layer.solo, 'bg-[#00b200]')} title="Solo" style={layer.solo ? { color: '#fff' } : {}}
              onClick={(e) => { e.stopPropagation(); setLayerSolo(layer.layerId, !layer.solo); }}>S</button>
            <button className={btnClass(false, '')} title="Note Processors"
              onClick={(e) => { e.stopPropagation(); alert('Not yet implemented'); }}>N</button>
            <button className={btnClass(false, '')} title="Automation"
              onClick={(e) => { e.stopPropagation(); alert('Not yet implemented'); }}>A</button>
          </div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
          <ContextMenu.Item className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerIndex - 1)}>
            Add Layer Above
          </ContextMenu.Item>
          <ContextMenu.Item className={ctxItemClass}
            onSelect={() => addLayer(groupId, layerIndex)}>
            Add Layer Below
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-blue-border/30 my-1" />
          <ContextMenu.Item className={ctxItemClass}
            onSelect={() => removeLayer(groupId, layer.layerId)}>
            Remove Layer
          </ContextMenu.Item>
          <ContextMenu.Item className={ctxItemClass} onSelect={() => alert('Not yet implemented')}>
            Push Up
          </ContextMenu.Item>
          <ContextMenu.Item className={ctxItemClass} onSelect={() => alert('Not yet implemented')}>
            Push Down
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-blue-border/30 my-1" />
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={`flex items-center justify-between ${ctxItemClass}`}>
              Layer Height
              <span className="text-[10px] opacity-60 ml-2">▸</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="min-w-[120px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                  <ContextMenu.Item
                    key={idx}
                    className={`${ctxItemClass} ${heightIndex === idx - 1 ? 'bg-blue-accent/20 font-medium' : ''}`}
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
