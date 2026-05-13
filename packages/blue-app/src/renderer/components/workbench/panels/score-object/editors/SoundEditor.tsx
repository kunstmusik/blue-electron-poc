import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  InstrumentPatch,
  SoundEditorPayload,
  SoundEditorTab,
  SoundAutomationParameterSnapshot,
} from '../../../../../../shared/project-editor';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import type { OrchestraPatch } from '../../../../../../shared/project-editor';
import BSBInterfaceEditor from '../../orchestra/bsb/BSBInterfaceEditor';
import BSBCodeEditor from '../../orchestra/bsb/BSBCodeEditor';
import BSBUDOPanel from '../../orchestra/bsb/BSBUDOPanel';

type SoundTabId = 'interface' | 'automation' | 'code' | 'udo' | 'comments';

const SOUND_TABS: Array<{ key: SoundTabId; label: string }> = [
  { key: 'interface', label: 'Interface' },
  { key: 'automation', label: 'Automation' },
  { key: 'code', label: 'Code' },
  { key: 'udo', label: 'UDO' },
  { key: 'comments', label: 'Comments' },
];

export default function SoundEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'Sound') return <></>;

  const payload = editor.payload as unknown as SoundEditorPayload;
  const { comment, bsbInstrument, automationParameters, availableTabs } = payload;
  const [activeTab, setActiveTab] = useState<SoundTabId>(availableTabs[0] ?? 'comments');

  const handleInstrumentPatch = useCallback((patch: InstrumentPatch) => {
    const scorePatch: Record<string, unknown> = {};
    if (patch.bsbInterface) {
      scorePatch.bsbInterfacePatch = patch.bsbInterface;
    }
    if (patch.instrumentText !== undefined || patch.alwaysOnInstrumentText !== undefined
      || patch.globalOrc !== undefined || patch.globalSco !== undefined) {
      scorePatch.bsbCodePatch = {};
      if (patch.instrumentText !== undefined) (scorePatch.bsbCodePatch as Record<string, unknown>).instrumentText = patch.instrumentText;
      if (patch.alwaysOnInstrumentText !== undefined) (scorePatch.bsbCodePatch as Record<string, unknown>).alwaysOnInstrumentText = patch.alwaysOnInstrumentText;
      if (patch.globalOrc !== undefined) (scorePatch.bsbCodePatch as Record<string, unknown>).globalOrc = patch.globalOrc;
      if (patch.globalSco !== undefined) (scorePatch.bsbCodePatch as Record<string, unknown>).globalSco = patch.globalSco;
    }
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: scorePatch,
    });
  }, [document.target, onPatch]);

  const handleOrchestraPatch = useCallback((_patch: OrchestraPatch) => {
    // no-op: Sound BSB patches go through handleInstrumentPatch
  }, []);

  const handleCommentChange = useCallback((value: string) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { comment: value },
    });
  }, [document.target, onPatch]);

  const handleAutomationPatch = useCallback((parameterId: string, updates: { automationEnabled?: boolean; points?: Array<{ x: number; y: number }>; curve?: string }) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { automationPatch: { parameterId, ...updates } },
    });
  }, [document.target, onPatch]);

  const visibleTabs = SOUND_TABS.filter((t) => availableTabs.includes(t.key as SoundEditorTab));

  return (
    <div className="flex h-full min-h-0 flex-col bg-blue-bg">
      <div className="border-b border-blue-border bg-[#10192a] px-2">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                data-sound-editor-tab={tab.key}
                className={[
                  'border-b-2 px-3 py-2 text-xs',
                  activeTab === tab.key
                    ? 'border-blue-accent text-gray-100'
                    : 'border-transparent text-blue-muted hover:text-gray-100',
                ].join(' ')}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === 'interface' && bsbInstrument && (
          <div className="h-full" aria-hidden={activeTab !== 'interface'}>
            <BSBInterfaceEditor
              instrument={bsbInstrument}
              onInstrumentPatch={handleInstrumentPatch}
            />
          </div>
        )}
        {activeTab === 'automation' && (
          <div className={activeTab === 'automation' ? 'h-full' : 'hidden'} aria-hidden={activeTab !== 'automation'}>
            <SoundAutomationPanel
              parameters={automationParameters}
              onAutomationPatch={handleAutomationPatch}
              startTimeBeats={document.shared.startTime.value}
              durationBeats={document.shared.subjectiveDuration.value}
            />
          </div>
        )}
        {activeTab === 'code' && bsbInstrument && (
          <div className={activeTab === 'code' ? 'h-full' : 'hidden'} aria-hidden={activeTab !== 'code'}>
            <BSBCodeEditor
              instrument={bsbInstrument}
              onInstrumentPatch={handleInstrumentPatch}
              onOrchestraPatch={handleOrchestraPatch}
            />
          </div>
        )}
        {activeTab === 'udo' && bsbInstrument && (
          <div className={activeTab === 'udo' ? 'h-full' : 'hidden'} aria-hidden={activeTab !== 'udo'}>
            <BSBUDOPanel
              instrument={bsbInstrument}
              onInstrumentPatch={handleInstrumentPatch}
            />
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="flex flex-col h-full p-3">
            <label className="text-xs text-blue-muted mb-1">Comment</label>
            <textarea
              className="flex-1 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none resize-none"
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Instrument comment..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sound Automation Panel ───

const LINE_COLORS = [
  '#20dd00', '#0000ff', '#ffa500', '#008b00', '#ff00ff',
  '#cd3700', '#68228b', '#00688b', '#2f4f4f', '#cd1076',
  '#8b6914', '#458b74', '#8b4513', '#4169e1', '#8b7d6b',
  '#000080', '#7cfc00', '#483d8b', '#ffd700', '#838b8b',
  '#8b1a1a', '#7fff00', '#8b2323', '#8b7355', '#458b74',
  '#fa8072', '#8b3e2f', '#008b8b', '#458b00', '#a020f0',
];

interface SoundAutomationPanelProps {
  parameters: SoundAutomationParameterSnapshot[];
  onAutomationPatch: (parameterId: string, updates: { automationEnabled?: boolean; points?: Array<{ x: number; y: number }>; curve?: string }) => void;
  startTimeBeats: number;
  durationBeats: number;
}

interface AutomationLineView extends SoundAutomationParameterSnapshot {
  color: string;
  displayName: string;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizePointY(line: Pick<AutomationLineView, 'minimum' | 'maximum'>, value: number): number {
  const range = line.maximum - line.minimum || 1;
  return clamp(1 - ((value - line.minimum) / range), 0, 1);
}

function darkenColor(color: string, ratio = 0.7): string {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = Math.floor(parseInt(hex.slice(0, 2), 16) * ratio);
  const g = Math.floor(parseInt(hex.slice(2, 4), 16) * ratio);
  const b = Math.floor(parseInt(hex.slice(4, 6), 16) * ratio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function ensureAutomationPoints(parameter: SoundAutomationParameterSnapshot): Array<{ x: number; y: number }> | undefined {
  if (parameter.points.length >= 2) return undefined;
  const fallbackY = clamp(parameter.value, parameter.minimum, parameter.maximum);
  if (parameter.points.length === 0) {
    return [
      { x: 0, y: fallbackY },
      { x: 1, y: fallbackY },
    ];
  }
  const point = parameter.points[0];
  const otherX = point.x < 1 ? 1 : 0;
  return [
    { x: point.x, y: clamp(point.y, parameter.minimum, parameter.maximum) },
    { x: otherX, y: clamp(point.y, parameter.minimum, parameter.maximum) },
  ].sort((left, right) => left.x - right.x);
}

function SoundAutomationPanel({
  parameters,
  onAutomationPatch,
  startTimeBeats,
  durationBeats,
}: SoundAutomationPanelProps): React.ReactElement {
  const sortedParameters = useMemo(
    () => [...parameters].sort((left, right) => {
      const leftName = left.name || left.label || left.parameterId;
      const rightName = right.name || right.label || right.parameterId;
      return leftName.localeCompare(rightName);
    }),
    [parameters],
  );

  const lines = useMemo<AutomationLineView[]>(
    () => sortedParameters
      .filter((parameter) => parameter.automationEnabled)
      .map((parameter, index) => ({
        ...parameter,
        displayName: parameter.name || parameter.label || parameter.parameterId,
        color: LINE_COLORS[index % LINE_COLORS.length] ?? '#51cf66',
      })),
    [sortedParameters],
  );
  const [selectedParamId, setSelectedParamId] = useState<string | null>(lines[0]?.parameterId ?? null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [draftEnabledMap, setDraftEnabledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (lines.length === 0) {
      setSelectedParamId(null);
      return;
    }
    if (!selectedParamId || !lines.some((line) => line.parameterId === selectedParamId)) {
      setSelectedParamId(lines[0]?.parameterId ?? null);
    }
  }, [lines, selectedParamId]);

  const handlePointDrag = useCallback((parameterId: string, pointIndex: number, newX: number, newY: number) => {
    const parameter = parameters.find((value) => value.parameterId === parameterId);
    if (!parameter) return;

    const isFirstPoint = pointIndex === 0;
    const isLastPoint = pointIndex === parameter.points.length - 1;
    const previous = parameter.points[pointIndex - 1];
    const next = parameter.points[pointIndex + 1];
    const minX = previous ? previous.x : 0;
    const maxX = next ? next.x : 1;
    const clampedX = isFirstPoint
      ? 0
      : isLastPoint
        ? 1
        : clamp(newX, minX, maxX);
    const clampedY = clamp(newY, parameter.minimum, parameter.maximum);

    const points = parameter.points.map((point, index) => (
      index === pointIndex ? { x: clampedX, y: clampedY } : point
    ));

    onAutomationPatch(parameterId, { points });
  }, [onAutomationPatch, parameters]);

  const handleAddPoint = useCallback((parameterId: string, x: number, y: number) => {
    const parameter = parameters.find((value) => value.parameterId === parameterId);
    if (!parameter || !parameter.automationEnabled) return;

    const points = [
      ...parameter.points,
      {
        x: clamp(x, 0, 1),
        y: clamp(y, parameter.minimum, parameter.maximum),
      },
    ].sort((left, right) => left.x - right.x);

    onAutomationPatch(parameterId, { points });
  }, [onAutomationPatch, parameters]);

  const handleRemovePoint = useCallback((parameterId: string, pointIndex: number) => {
    const parameter = parameters.find((value) => value.parameterId === parameterId);
    if (!parameter || parameter.points.length <= 2) return;
    if (pointIndex <= 0 || pointIndex >= parameter.points.length - 1) return;

    const points = parameter.points.filter((_, index) => index !== pointIndex);
    onAutomationPatch(parameterId, { points });
  }, [onAutomationPatch, parameters]);

  const openEditDialog = useCallback(() => {
    const initial: Record<string, boolean> = {};
    for (const parameter of sortedParameters) {
      initial[parameter.parameterId] = parameter.automationEnabled;
    }
    setDraftEnabledMap(initial);
    setShowEditDialog(true);
  }, [sortedParameters]);

  const applyEditDialogChanges = useCallback(() => {
    for (const parameter of parameters) {
      const nextEnabled = Boolean(draftEnabledMap[parameter.parameterId]);
      if (nextEnabled === parameter.automationEnabled) continue;

      const points = nextEnabled ? ensureAutomationPoints(parameter) : undefined;
      onAutomationPatch(parameter.parameterId, {
        automationEnabled: nextEnabled,
        points,
      });
    }
    setShowEditDialog(false);
  }, [draftEnabledMap, onAutomationPatch, parameters]);

  if (parameters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-blue-muted text-sm">
        No automatable parameters available.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#05090f]">
      <div className="min-h-0 flex-1">
        <SoundAutomationCanvas
          lines={lines}
          selectedParamId={selectedParamId}
          startTimeBeats={startTimeBeats}
          durationBeats={durationBeats}
          onSelectLine={setSelectedParamId}
          onPointDrag={handlePointDrag}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
        />
      </div>
      <div className="flex items-center gap-2 border-t border-blue-border bg-[#1d2c45] px-2 py-1 text-xs text-gray-100">
        <span className="text-gray-200">Automations</span>
        <select
          className="min-w-0 flex-1 rounded border border-blue-border bg-[#22324d] px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
          value={selectedParamId ?? ''}
          onChange={(event) => setSelectedParamId(event.target.value)}
          disabled={lines.length === 0}
        >
          {lines.length === 0 ? (
            <option value="">No automations enabled</option>
          ) : (
            lines.map((line) => (
              <option key={line.parameterId} value={line.parameterId}>
                {line.displayName}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          className="rounded border border-blue-border bg-[#22324d] px-3 py-1 text-xs text-gray-100 hover:border-blue-accent"
          onClick={openEditDialog}
        >
          Edit
        </button>
      </div>

      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEditDialog(false)}>
          <div className="w-160 max-h-[70vh] overflow-hidden rounded border border-blue-border bg-[#1d2c45] shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-blue-border px-4 py-3 text-lg font-semibold text-gray-100">
              Choose Parameters to Automate
            </div>
            <div className="max-h-[50vh] overflow-auto">
              <table className="w-full border-collapse text-sm text-gray-100">
                <thead>
                  <tr className="border-b border-blue-border bg-[#233550]">
                    <th className="px-3 py-2 text-left font-medium">Enabled</th>
                    <th className="px-3 py-2 text-left font-medium">Parameter Name</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParameters.map((parameter) => (
                    <tr key={parameter.parameterId} className="border-b border-blue-border/40">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(draftEnabledMap[parameter.parameterId])}
                          onChange={(event) => {
                            setDraftEnabledMap((current) => ({
                              ...current,
                              [parameter.parameterId]: event.target.checked,
                            }));
                          }}
                          className="accent-blue-accent"
                        />
                      </td>
                      <td className="px-3 py-2">{parameter.name || parameter.label || parameter.parameterId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-blue-border px-4 py-3">
              <button
                type="button"
                className="rounded border border-blue-border bg-[#22324d] px-4 py-1.5 text-sm text-gray-200 hover:border-blue-accent"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded border border-blue-accent bg-[#3d5f89] px-4 py-1.5 text-sm font-semibold text-gray-100 hover:bg-[#4b73a6]"
                onClick={applyEditDialogChanges}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SoundAutomationCanvasProps {
  lines: AutomationLineView[];
  selectedParamId: string | null;
  startTimeBeats: number;
  durationBeats: number;
  onSelectLine: (parameterId: string) => void;
  onPointDrag: (parameterId: string, pointIndex: number, x: number, y: number) => void;
  onAddPoint: (parameterId: string, x: number, y: number) => void;
  onRemovePoint: (parameterId: string, pointIndex: number) => void;
}

function SoundAutomationCanvas({
  lines,
  selectedParamId,
  startTimeBeats,
  durationBeats,
  onSelectLine,
  onPointDrag,
  onAddPoint,
  onRemovePoint,
}: SoundAutomationCanvasProps): React.ReactElement {
  const canUseDom = typeof document !== 'undefined';
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<SVGSVGElement | null>(null);
  const [dragState, setDragState] = useState<{ parameterId: string; pointIndex: number } | null>(null);
  const [hoverState, setHoverState] = useState<{ parameterId: string; pointIndex: number } | null>(null);
  const [plotSize, setPlotSize] = useState({ width: 1, height: 1 });

  const selectedLine = useMemo(
    () => lines.find((line) => line.parameterId === selectedParamId) ?? lines[0] ?? null,
    [lines, selectedParamId],
  );
  const effectiveDuration = durationBeats > 0 ? durationBeats : 1;
  const plotWidth = Math.max(1, plotSize.width);
  const plotHeight = Math.max(1, plotSize.height);

  useEffect(() => {
    const element = graphContainerRef.current;
    if (!element) return undefined;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setPlotSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getCoords = useCallback((clientX: number, clientY: number) => {
    const svg = graphRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const yFromTop = clamp((clientY - rect.top) / rect.height, 0, 1);
    return { x, yFromTop, rect };
  }, []);

  const findPointHit = useCallback((clientX: number, clientY: number, lineFilterId?: string) => {
    const coords = getCoords(clientX, clientY);
    if (!coords) return null;

    let best: { parameterId: string; pointIndex: number; distance: number } | null = null;

    for (const line of lines) {
      if (lineFilterId && line.parameterId !== lineFilterId) continue;
      for (let index = 0; index < line.points.length; index++) {
        const point = line.points[index];
        const px = point.x * coords.rect.width;
        const py = normalizePointY(line, point.y) * coords.rect.height;
        const dx = px - (coords.x * coords.rect.width);
        const dy = py - (coords.yFromTop * coords.rect.height);
        const distance = Math.hypot(dx, dy);
        if (distance <= 8 && (!best || distance < best.distance)) {
          best = { parameterId: line.parameterId, pointIndex: index, distance };
        }
      }
    }

    if (!best) return null;
    return { parameterId: best.parameterId, pointIndex: best.pointIndex };
  }, [getCoords, lines]);

  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    const hit = findPointHit(event.clientX, event.clientY);
    if (hit) {
      event.preventDefault();
      event.stopPropagation();
      onSelectLine(hit.parameterId);
      setHoverState(hit);
      setDragState(hit);
      return;
    }

    if (!selectedLine) return;
    const coords = getCoords(event.clientX, event.clientY);
    if (!coords) return;

    const value = selectedLine.minimum + ((1 - coords.yFromTop) * (selectedLine.maximum - selectedLine.minimum || 1));
    onAddPoint(selectedLine.parameterId, coords.x, value);
    onSelectLine(selectedLine.parameterId);
  }, [findPointHit, getCoords, onAddPoint, onSelectLine, selectedLine]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedLine || dragState) return;
    const hit = findPointHit(event.clientX, event.clientY, selectedLine.parameterId);
    setHoverState(hit);
  }, [dragState, findPointHit, selectedLine]);

  useEffect(() => {
    if (!dragState || !selectedLine) return undefined;

    const handleWindowMouseMove = (event: MouseEvent) => {
      const coords = getCoords(event.clientX, event.clientY);
      if (!coords) return;

      const pointIndex = dragState.pointIndex;
      const previous = selectedLine.points[pointIndex - 1];
      const next = selectedLine.points[pointIndex + 1];
      const minX = previous ? previous.x : 0;
      const maxX = next ? next.x : 1;
      const x = clamp(coords.x, minX, maxX);
      const y = selectedLine.minimum + ((1 - coords.yFromTop) * (selectedLine.maximum - selectedLine.minimum || 1));
      onPointDrag(selectedLine.parameterId, pointIndex, x, y);
      setHoverState({ parameterId: selectedLine.parameterId, pointIndex });
    };

    const handleWindowMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [dragState, getCoords, onPointDrag, selectedLine]);

  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (!selectedLine) return;
    const hit = findPointHit(event.clientX, event.clientY, selectedLine.parameterId);
    if (!hit) return;
    onRemovePoint(selectedLine.parameterId, hit.pointIndex);
  }, [findPointHit, onRemovePoint, selectedLine]);

  const hoverTooltip = useMemo(() => {
    if (!hoverState) return null;
    const line = lines.find((candidate) => candidate.parameterId === hoverState.parameterId);
    if (!line) return null;
    const point = line.points[hoverState.pointIndex];
    if (!point) return null;
    const svg = graphRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    return {
      pointX: rect.left + (point.x * rect.width),
      pointY: rect.top + (normalizePointY(line, point.y) * rect.height),
      canvasTop: rect.top,
      xText: (startTimeBeats + (point.x * effectiveDuration)).toFixed(3),
      yText: point.y.toFixed(4),
      label: line.label || line.name || '',
    };
  }, [effectiveDuration, hoverState, lines, startTimeBeats]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-black">
      <div className="relative h-6 border-b border-blue-border bg-[#1f2432] text-[10px] text-gray-200">
        {Array.from({ length: 7 }, (_, index) => {
          const ratio = index / 6;
          const time = startTimeBeats + (ratio * effectiveDuration);
          return (
            <div key={index} className="absolute top-0 h-full" style={{ left: `${ratio * 100}%` }}>
              <div className="h-3 border-l border-blue-border/70" />
              <div className="-translate-x-1/2 pl-1">{time.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <div ref={graphContainerRef} className="min-h-0 flex-1 bg-black">
        <svg
          ref={graphRef}
          className="block h-full w-full cursor-crosshair select-none"
          width={plotWidth}
          height={plotHeight}
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          preserveAspectRatio="none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (!dragState) setHoverState(null);
          }}
          onContextMenu={handleContextMenu}
        >
          {lines.map((line) => {
            if (line.points.length === 0) return null;
            const points = [...line.points].sort((left, right) => left.x - right.x);
            const selected = selectedLine?.parameterId === line.parameterId;
            const color = selected ? line.color : darkenColor(line.color);
            const segments = points.map((point) => `${point.x * plotWidth},${normalizePointY(line, point.y) * plotHeight}`);
            return (
              <g key={line.parameterId}>
                <polyline
                  points={segments.join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {selected && points.map((point, index) => {
                  const hovered = hoverState?.parameterId === line.parameterId && hoverState.pointIndex === index;
                  return (
                    <circle
                      key={`${line.parameterId}-${index}`}
                      cx={point.x * plotWidth}
                      cy={normalizePointY(line, point.y) * plotHeight}
                      r={hovered ? 4 : 3.5}
                      fill="#000000"
                      stroke={hovered ? '#ff4d4f' : line.color}
                      strokeWidth={1.2}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {canUseDom && hoverTooltip && createPortal(
        <div
          className="pointer-events-none fixed z-9998 min-w-35 rounded border border-[#2b3f5f] bg-[#0a0f1a] px-3 py-2 font-mono text-[10px] text-white shadow-lg"
          style={{
            left: Math.max(8, Math.min(hoverTooltip.pointX + 10, window.innerWidth - 176)),
            top: Math.max(8, Math.min(hoverTooltip.canvasTop - 44, window.innerHeight - 44)),
          }}
        >
          <div>x: {hoverTooltip.xText}</div>
          <div>y: {hoverTooltip.yText} {hoverTooltip.label}</div>
        </div>,
        document.body,
      )}
    </div>
  );
}
