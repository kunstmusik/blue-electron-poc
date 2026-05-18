import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  EditableLineCanvas,
  getJavaLineColor,
  useMeasuredElementSize,
} from '../../shared/line-editor/EditableLineCanvas';

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

interface SoundAutomationPanelProps {
  parameters: SoundAutomationParameterSnapshot[];
  onAutomationPatch: (parameterId: string, updates: { automationEnabled?: boolean; points?: Array<{ x: number; y: number }>; curve?: string }) => void;
  startTimeBeats: number;
  durationBeats: number;
}

interface AutomationLineView {
  parameterId: string;
  name: string;
  displayName: string;
  color: number;
  min: number;
  max: number;
  rightBound: boolean;
  endPointsLinked: boolean;
  points: Array<{ x: number; y: number }>;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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

function pointsEqual(left: Array<{ x: number; y: number }>, right: Array<{ x: number; y: number }>): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftPoint = left[index];
    const rightPoint = right[index];
    if (!leftPoint || !rightPoint || leftPoint.x !== rightPoint.x || leftPoint.y !== rightPoint.y) {
      return false;
    }
  }

  return true;
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
        parameterId: parameter.parameterId,
        name: parameter.name || parameter.label || parameter.parameterId,
        displayName: parameter.name || parameter.label || parameter.parameterId,
        color: getJavaLineColor(index),
        min: parameter.minimum,
        max: parameter.maximum,
        rightBound: true,
        endPointsLinked: false,
        points: (ensureAutomationPoints(parameter) ?? parameter.points).map((point) => ({ ...point })),
      })),
    [sortedParameters],
  );
  const [selectedParamId, setSelectedParamId] = useState<string | null>(lines[0]?.parameterId ?? null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [draftEnabledMap, setDraftEnabledMap] = useState<Record<string, boolean>>({});
  const selectedLineIndex = useMemo(() => {
    if (lines.length === 0) {
      return 0;
    }
    const index = lines.findIndex((line) => line.parameterId === selectedParamId);
    return index >= 0 ? index : 0;
  }, [lines, selectedParamId]);

  useEffect(() => {
    if (lines.length === 0) {
      setSelectedParamId(null);
      return;
    }
    if (!selectedParamId || !lines.some((line) => line.parameterId === selectedParamId)) {
      setSelectedParamId(lines[0]?.parameterId ?? null);
    }
  }, [lines, selectedParamId]);

  const handleLinesChange = useCallback((nextLines: AutomationLineView[]) => {
    nextLines.forEach((nextLine, index) => {
      const previousLine = lines[index];
      if (!previousLine || previousLine.parameterId !== nextLine.parameterId) {
        onAutomationPatch(nextLine.parameterId, {
          points: nextLine.points.map((point) => ({ ...point })),
        });
        return;
      }
      if (!pointsEqual(previousLine.points, nextLine.points)) {
        onAutomationPatch(nextLine.parameterId, {
          points: nextLine.points.map((point) => ({ ...point })),
        });
      }
    });
  }, [lines, onAutomationPatch]);

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
          selectedLineIndex={selectedLineIndex}
          startTimeBeats={startTimeBeats}
          durationBeats={durationBeats}
          onLinesChange={handleLinesChange}
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
  selectedLineIndex: number;
  startTimeBeats: number;
  durationBeats: number;
  onLinesChange: (nextLines: AutomationLineView[]) => void;
}

function SoundAutomationCanvas({
  lines,
  selectedLineIndex,
  startTimeBeats,
  durationBeats,
  onLinesChange,
}: SoundAutomationCanvasProps): React.ReactElement {
  const { ref: canvasHostRef, size: canvasSize } = useMeasuredElementSize<HTMLDivElement>({ width: 720, height: 360 });
  const effectiveDuration = durationBeats > 0 ? durationBeats : 1;
  const tooltipFormatter = useCallback(({ line, point }: {
    line: AutomationLineView;
    point: { x: number; y: number };
    lineIndex: number;
    pointIndex: number;
  }) => ({
    xText: (startTimeBeats + (point.x * effectiveDuration)).toFixed(3),
    yText: point.y.toFixed(4),
    ySuffix: line.displayName,
  }), [effectiveDuration, startTimeBeats]);

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
      <div ref={canvasHostRef} className="min-h-0 flex-1 bg-black">
        <EditableLineCanvas
          lines={lines}
          selectedLineIndex={selectedLineIndex}
          onLinesChange={onLinesChange}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          interactive
          className="h-full w-full"
          backgroundColor="#000000"
          plotBackgroundColor="#000000"
          plotBorderColor="#d3d3d3"
          tooltipFormatter={tooltipFormatter}
        />
      </div>
    </div>
  );
}
