import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import type { TrackerColumnSnapshot } from '../../../../../../shared/project-editor';
import GeneratedScoreModal from './GeneratedScoreModal';
import { useScoreObjectTest } from './useScoreObjectTest';

const COLUMN_TYPES = [
  { label: 'PCH', value: 0 },
  { label: 'blue PCH', value: 1 },
  { label: 'MIDI', value: 2 },
  { label: 'String', value: 3 },
  { label: 'Number', value: 4 },
];

const SHORTCUT_HELP = [
  ['ctrl-space', 'clear or duplicate previous note'],
  ['ctrl-shift-space', 'toggle OFF note'],
  ['ctrl-up', 'increment value'],
  ['ctrl-down', 'decrement value'],
  ['ctrl-t', 'toggle note tie'],
  ['ctrl-x', 'cut selected notes'],
  ['ctrl-c', 'copy selected notes'],
  ['ctrl-v', 'paste notes from copy buffer'],
  ['del', 'delete selected notes'],
  ['', ''],
  ['ctrl-k', 'toggle keyboard note shortcuts'],
  ['ctrl-shift-up', 'raise keyboard octave by one'],
  ['ctrl-shift-down', 'lower keyboard octave by one'],
  ['?', 'open this shortcuts panel'],
];

interface NoteSnapshot {
  tied: boolean;
  off: boolean;
  fields: string[];
}

type TrackerScaleSnapshot = NonNullable<TrackerColumnSnapshot['scale']>;

const KEYBOARD_NOTE_MAP: Array<[string, number]> = [
  ['z', 0], ['s', 1], ['x', 2], ['d', 3], ['c', 4],
  ['v', 5], ['g', 6], ['b', 7], ['h', 8], ['n', 9],
  ['j', 10], ['m', 11],
  ['q', 12], ['2', 13], ['w', 14], ['3', 15], ['e', 16],
  ['r', 17], ['5', 18], ['t', 19], ['6', 20], ['y', 21],
  ['7', 22], ['u', 23], ['i', 24], ['9', 25], ['o', 26],
  ['0', 27], ['p', 28],
];

const COL_TYPE_PCH = 0;
const COL_TYPE_BLUE_PCH = 1;
const COL_TYPE_MIDI = 2;
const COL_TYPE_STR = 3;
const COL_TYPE_NUM = 4;

function createDefaultScaleSnapshot() {
  return {
    scaleName: '12TET',
    baseFrequency: 261.625565,
    octave: 2,
    ratios: Array.from({ length: 12 }, (_, index) => Math.pow(Math.pow(2, 1 / 12), index)),
  };
}

function cloneTrackerColumnSnapshot(column: TrackerColumnSnapshot): TrackerColumnSnapshot {
  return {
    ...column,
    scale: column.scale
      ? {
        ...column.scale,
        ratios: Array.isArray(column.scale.ratios) ? [...column.scale.ratios] : [],
      }
      : null,
  };
}

function normalizeVisualOnlyTrackerValue(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '...' || trimmed === '---') {
    return '';
  }
  return trimmed;
}

function isStrictIntegerString(value: string): boolean {
  return /^[+-]?\d+$/.test(value);
}

function computeKeyboardNoteValue(
  semitoneOffset: number,
  octaveOffset: number,
  column: TrackerColumnSnapshot | null,
): string | null {
  const columnType = column?.type;
  switch (columnType) {
    case COL_TYPE_PCH: {
      const val = (8 + octaveOffset) * 12 + semitoneOffset;
      const oct = Math.floor(val / 12);
      const pch = val % 12;
      const pchStr = pch < 10 ? `0${pch}` : `${pch}`;
      return `${oct}.${pchStr}`;
    }
    case COL_TYPE_BLUE_PCH: {
      const scaleDegrees = column?.scale?.ratios?.length && column.scale.ratios.length > 0
        ? column.scale.ratios.length
        : 12;
      const base = (8 + octaveOffset) * scaleDegrees + semitoneOffset;
      const oct = Math.floor(base / scaleDegrees);
      const degree = base % scaleDegrees;
      return `${oct}.${degree}`;
    }
    case COL_TYPE_MIDI: {
      return `${60 + octaveOffset * 12 + semitoneOffset}`;
    }
    default:
      return null;
  }
}

function getCellKey(trackIndex: number, columnIndex: number, stepIndex: number): string {
  return `${trackIndex}:${columnIndex}:${stepIndex}`;
}

function isTrackerValueValid(input: string, column: TrackerColumnSnapshot): boolean {
  const val = normalizeVisualOnlyTrackerValue(input);
  if (val.length === 0) return true;

  switch (column.type) {
    case COL_TYPE_PCH: {
      const parts = val.split('.');
      if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) return false;
      return !Number.isNaN(Number.parseFloat(val));
    }
    case COL_TYPE_BLUE_PCH: {
      const parts = val.split('.');
      if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) return false;
      const oct = Number.parseInt(parts[0], 10);
      const degree = Number.parseInt(parts[1], 10);
      if (Number.isNaN(oct) || Number.isNaN(degree)) return false;
      return !parts[1].startsWith('0') || parts[1].length <= 1;
    }
    case COL_TYPE_MIDI: {
      const midi = Number.parseInt(val, 10);
      return !Number.isNaN(midi) && midi >= 0 && midi < 128;
    }
    case COL_TYPE_NUM: {
      const parsed = column.restrictedToInteger ? Number.parseInt(val, 10) : Number(val);
      if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
        return false;
      }
      if (column.restrictedToInteger && !isStrictIntegerString(val)) {
        return false;
      }
      if (column.usingRange) {
        return parsed >= column.rangeMin && parsed <= column.rangeMax;
      }
      return true;
    }
    case COL_TYPE_STR:
    default:
      return true;
  }
}

function ShortcutHelpModal({ onClose }: { onClose: () => void }): React.ReactElement {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-[420px] flex-col rounded-lg border border-blue-border bg-[#1a1b26] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-blue-border px-4 py-3 bg-blue-bg">
          <h2 className="text-sm font-medium text-gray-100">Keyboard Shortcuts</h2>
          <button
            className="px-2 text-lg leading-none text-blue-muted hover:text-gray-100"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs">
            <tbody>
              {SHORTCUT_HELP.map(([key, desc], i) => (
                <tr key={i} className={desc ? '' : 'h-2'}>
                  {desc ? (
                    <>
                      <td className="py-1 pr-4 font-mono text-blue-accent whitespace-nowrap">
                        {key}
                      </td>
                      <td className="py-1 text-gray-300">{desc}</td>
                    </>
                  ) : (
                    <td colSpan={2} />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-blue-border px-4 py-3 bg-blue-bg">
          <button
            className="px-4 py-1.5 text-xs rounded bg-blue-accent text-white hover:bg-blue-accent-hover"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function parseScalaFile(text: string, fallbackName: string): TrackerScaleSnapshot | null {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('!') && line.trim().length > 0);

  if (lines.length === 0) {
    return null;
  }

  const scaleName = lines[0]!.trim() || fallbackName;
  const countLine = lines.length > 1 ? lines[1]!.trim() : '';
  const expectedCount = Number.parseInt(countLine, 10);
  const ratioStart = Number.isFinite(expectedCount) ? 2 : 1;
  const ratioLines = lines.slice(ratioStart);

  const ratios: number[] = [];
  for (const line of ratioLines) {
    const trimmed = line.trim().split(/\s/)[0]!;
    if (!trimmed) continue;

    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      const num = Number.parseFloat(parts[0]!);
      const den = Number.parseFloat(parts[1]!);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        ratios.push(num / den);
      }
      continue;
    }

    if (trimmed.includes('.')) {
      const cents = Number.parseFloat(trimmed);
      if (Number.isFinite(cents)) {
        ratios.push(Math.pow(2, cents / 1200));
      }
      continue;
    }

    const val = Number.parseFloat(trimmed);
    if (Number.isFinite(val) && val > 0) {
      ratios.push(val);
    }
  }

  if (ratios.length === 0) {
    return null;
  }

  return {
    scaleName,
    baseFrequency: 261.6255653005986,
    octave: 2,
    ratios,
  };
}

function getColumnTypeLabel(type: number): string {
  return COLUMN_TYPES.find((entry) => entry.value === type)?.label ?? 'Unknown';
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

function getColumnSummary(column: TrackerColumnSnapshot): string {
  switch (column.type) {
    case COL_TYPE_BLUE_PCH: {
      const scaleName = column.scale?.scaleName || '12TET';
      const baseFreq = formatCompactNumber(column.scale?.baseFrequency ?? 261.625565);
      const outputLabel = column.outputFrequency ? 'output freq' : 'output pch';
      return `blue PCH • ${scaleName} • base ${baseFreq} • ${outputLabel}`;
    }
    case COL_TYPE_NUM: {
      const intLabel = column.restrictedToInteger ? 'integer' : 'float';
      const rangeLabel = column.usingRange
        ? `range ${formatCompactNumber(column.rangeMin)}..${formatCompactNumber(column.rangeMax)}`
        : 'unbounded';
      return `Number • ${intLabel} • ${rangeLabel}`;
    }
    default:
      return getColumnTypeLabel(column.type);
  }
}

function ColumnConfigModal({
  column,
  onClose,
  onSave,
}: {
  column: TrackerColumnSnapshot;
  onClose: () => void;
  onSave: (column: TrackerColumnSnapshot) => void;
}): React.ReactElement {
  const [draft, setDraft] = useState<TrackerColumnSnapshot>(() => cloneTrackerColumnSnapshot(column));
  const [baseFreqText, setBaseFreqText] = useState(
    formatCompactNumber(column.scale?.baseFrequency ?? 261.625565),
  );

  useEffect(() => {
    setBaseFreqText(formatCompactNumber(draft.scale?.baseFrequency ?? 261.625565));
  }, [draft.scale?.baseFrequency]);

  const handleChooseScale = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.scl';
    input.click();

    await new Promise<void>((resolve) => {
      input.onchange = () => resolve();
    });

    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseScalaFile(text, file.name.replace(/\.scl$/i, ''));
      if (!parsed) return;
      setDraft((prev) => ({ ...prev, scale: parsed }));
    } catch {
      // ignore file read errors
    }
  }, []);

  const commitBaseFrequency = useCallback(() => {
    const parsed = Number(baseFreqText);
    if (!Number.isFinite(parsed)) {
      setBaseFreqText(formatCompactNumber(draft.scale?.baseFrequency ?? 261.625565));
      return;
    }
    const nextBase = Math.max(0, parsed);
    setDraft((prev) => ({
      ...prev,
      scale: {
        ...(prev.scale ?? createDefaultScaleSnapshot()),
        baseFrequency: nextBase,
      },
    }));
  }, [baseFreqText, draft.scale]);

  const handleSave = () => {
    let rangeMin = draft.rangeMin;
    let rangeMax = draft.rangeMax;
    if (!Number.isFinite(rangeMin)) rangeMin = 0;
    if (!Number.isFinite(rangeMax)) rangeMax = 0;
    if (rangeMin > rangeMax) {
      const temp = rangeMin;
      rangeMin = rangeMax;
      rangeMax = temp;
    }
    if (draft.restrictedToInteger) {
      rangeMin = Math.trunc(rangeMin);
      rangeMax = Math.trunc(rangeMax);
    }

    onSave({
      ...draft,
      rangeMin,
      rangeMax,
      scale: draft.scale ? { ...draft.scale, ratios: [...draft.scale.ratios] } : createDefaultScaleSnapshot(),
    });
  };

  const scale = draft.scale ?? createDefaultScaleSnapshot();
  const isBluePch = draft.type === COL_TYPE_BLUE_PCH;
  const isNumber = draft.type === COL_TYPE_NUM;
  const rangeEnabled = isNumber && draft.usingRange;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-[520px] flex-col rounded-lg border border-blue-border bg-[#1a1b26] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-blue-border px-4 py-3 bg-blue-bg">
          <h3 className="text-sm font-medium text-gray-100">Column Configuration</h3>
          <button
            className="px-2 text-lg leading-none text-blue-muted hover:text-gray-100"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="flex flex-col gap-4 p-5 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-blue-muted">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {COLUMN_TYPES.map((typeOption) => (
                <label
                  key={typeOption.value}
                  className={`flex items-center gap-2 rounded border px-2 py-1.5 text-xs ${
                    draft.type === typeOption.value
                      ? 'border-blue-accent bg-blue-accent/10 text-gray-100'
                      : 'border-blue-border bg-black/20 text-blue-muted'
                  }`}
                >
                  <input
                    type="radio"
                    className="accent-blue-accent"
                    checked={draft.type === typeOption.value}
                    onChange={() => {
                      setDraft((prev) => ({ ...prev, type: typeOption.value }));
                    }}
                  />
                  <span>{typeOption.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={`flex flex-col gap-2 rounded border p-3 ${isBluePch ? 'border-blue-border bg-black/20' : 'border-blue-border/40 bg-black/10 opacity-60'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-muted">Blue PCH</div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-[11px] text-blue-muted">Scale</span>
              <input
                className="flex-1 rounded border border-blue-border bg-black/30 px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
                value={scale.scaleName}
                readOnly
                disabled={!isBluePch}
              />
              <button
                className="rounded border border-blue-border bg-black/30 px-2 py-1 text-xs text-gray-200 hover:border-blue-accent disabled:opacity-50"
                onClick={handleChooseScale}
                disabled={!isBluePch}
              >
                ...
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-[11px] text-blue-muted">Base Freq</span>
              <input
                className="flex-1 rounded border border-blue-border bg-black/30 px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none disabled:opacity-50"
                value={baseFreqText}
                disabled={!isBluePch}
                onChange={(e) => setBaseFreqText(e.target.value)}
                onBlur={commitBaseFrequency}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-200">
              <input
                type="checkbox"
                className="accent-blue-accent"
                checked={draft.outputFrequency}
                disabled={!isBluePch}
                onChange={(e) => setDraft((prev) => ({ ...prev, outputFrequency: e.target.checked }))}
              />
              Output Frequencies
            </label>
          </div>

          <div className={`flex flex-col gap-2 rounded border p-3 ${isNumber ? 'border-blue-border bg-black/20' : 'border-blue-border/40 bg-black/10 opacity-60'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-muted">Number</div>
            <label className="flex items-center gap-2 text-xs text-gray-200">
              <input
                type="checkbox"
                className="accent-blue-accent"
                checked={draft.restrictedToInteger}
                disabled={!isNumber}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDraft((prev) => ({
                    ...prev,
                    restrictedToInteger: checked,
                    rangeMin: checked ? Math.trunc(prev.rangeMin) : prev.rangeMin,
                    rangeMax: checked ? Math.trunc(prev.rangeMax) : prev.rangeMax,
                  }));
                }}
              />
              Restrict to Integer
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-200">
              <input
                type="checkbox"
                className="accent-blue-accent"
                checked={draft.usingRange}
                disabled={!isNumber}
                onChange={(e) => setDraft((prev) => ({ ...prev, usingRange: e.target.checked }))}
              />
              Use Range
            </label>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1">
              <span className="text-[11px] text-blue-muted">Min</span>
              <input
                type="number"
                step={draft.restrictedToInteger ? 1 : 'any'}
                disabled={!rangeEnabled}
                className="rounded border border-blue-border bg-black/30 px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none disabled:opacity-50"
                value={draft.rangeMin}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setDraft((prev) => ({ ...prev, rangeMin: next }));
                  }
                }}
              />
              <span className="text-[11px] text-blue-muted">Max</span>
              <input
                type="number"
                step={draft.restrictedToInteger ? 1 : 'any'}
                disabled={!rangeEnabled}
                className="rounded border border-blue-border bg-black/30 px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none disabled:opacity-50"
                value={draft.rangeMax}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setDraft((prev) => ({ ...prev, rangeMax: next }));
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-blue-border px-4 py-3 bg-blue-bg">
          <button
            className="px-4 py-1.5 text-xs rounded border border-blue-border bg-blue-surface/40 text-blue-text hover:bg-blue-surface/70 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 text-xs rounded bg-blue-accent text-white hover:bg-blue-accent-hover"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackPropertiesModal({
  track,
  onClose,
  onSave,
}: {
  track: {
    trackName: string;
    instrumentId: string;
    noteTemplate: string;
    columns: TrackerColumnSnapshot[];
  };
  onClose: () => void;
  onSave: (properties: {
    name: string;
    instrumentId: string;
    noteTemplate: string;
    columns: TrackerColumnSnapshot[];
  }) => void;
}): React.ReactElement {
  const [name, setName] = useState(track.trackName || '');
  const [instrumentId, setInstrumentId] = useState(track.instrumentId || '');
  const [noteTemplate, setNoteTemplate] = useState(track.noteTemplate || '');
  const [columns, setColumns] = useState<TrackerColumnSnapshot[]>(
    (track.columns ?? []).map((column) => cloneTrackerColumnSnapshot(column)),
  );
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);

  const handleAddColumn = () => {
    const scale = createDefaultScaleSnapshot();
    setColumns((prev) => [
      ...prev,
      {
        name: `col${prev.length + 1}`,
        type: COL_TYPE_NUM,
        restrictedToInteger: false,
        usingRange: false,
        rangeMin: 0,
        rangeMax: 0,
        outputFrequency: true,
        scale,
        sourceIndex: null,
      },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
    setEditingColumnIndex((prev) => (prev === index ? null : prev !== null && prev > index ? prev - 1 : prev));
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= columns.length) return;
    setColumns((prev) => {
      const next = [...prev];
      const [moving] = next.splice(index, 1);
      next.splice(nextIndex, 0, moving);
      return next;
    });
    setEditingColumnIndex((prev) => (prev === index ? nextIndex : prev === nextIndex ? index : prev));
  };

  const handleColumnNameChange = (index: number, nextName: string) => {
    setColumns((prev) => prev.map((column, i) => (i === index ? { ...column, name: nextName } : column)));
  };

  const handleColumnConfigSave = (nextColumn: TrackerColumnSnapshot) => {
    if (editingColumnIndex === null) return;
    setColumns((prev) => prev.map((column, index) => (
      index === editingColumnIndex ? cloneTrackerColumnSnapshot(nextColumn) : column
    )));
    setEditingColumnIndex(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-[760px] flex-col rounded-lg border border-blue-border bg-[#1a1b26] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-blue-border px-4 py-3 bg-blue-bg">
          <h2 className="text-sm font-medium text-gray-100">Track Properties</h2>
          <button
            className="px-2 text-lg leading-none text-blue-muted hover:text-gray-100"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="flex flex-col gap-6 p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-blue-muted uppercase tracking-wider">Name</label>
              <input
                type="text"
                className="w-full rounded border border-blue-border bg-black/30 px-2 py-1.5 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-blue-muted uppercase tracking-wider">Instrument ID</label>
              <input
                type="text"
                className="w-full rounded border border-blue-border bg-black/30 px-2 py-1.5 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
                value={instrumentId}
                onChange={(e) => setInstrumentId(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-blue-muted uppercase tracking-wider">Note Template</label>
            <textarea
              className="w-full h-16 rounded border border-blue-border bg-black/30 px-2 py-1.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none resize-none"
              value={noteTemplate}
              onChange={(e) => setNoteTemplate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-blue-muted uppercase tracking-wider">Columns</label>
              <button
                onClick={handleAddColumn}
                className="text-[10px] bg-blue-accent/20 text-blue-accent px-2 py-0.5 rounded border border-blue-accent/30 hover:bg-blue-accent/30"
              >
                + Add Column
              </button>
            </div>
            <div className="flex flex-col gap-2 rounded border border-blue-border/40 p-2 bg-black/20">
              {columns.length === 0 && (
                <div className="text-[11px] text-center text-blue-muted py-2">No data columns</div>
              )}
              {columns.map((column, index) => (
                <div key={index} className="group grid grid-cols-[minmax(0,1fr)_280px_auto] items-center gap-2 rounded border border-blue-border/20 bg-black/20 px-2 py-1.5">
                  <input
                    type="text"
                    placeholder="Name"
                    className="min-w-0 rounded border border-blue-border bg-black/30 px-2 py-1 text-[11px] text-gray-100 focus:border-blue-accent focus:outline-none"
                    value={column.name}
                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                  />
                  <div className="relative">
                    <div className="rounded border border-blue-border bg-black/30 px-2 py-1 pr-14 text-[11px] text-blue-muted overflow-hidden text-ellipsis whitespace-nowrap">
                      {getColumnSummary(column)}
                    </div>
                    <button
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded border border-blue-border px-1.5 py-0.5 text-[10px] text-gray-200 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:border-blue-accent"
                      onClick={() => setEditingColumnIndex(index)}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="w-6 rounded border border-blue-border text-xs text-gray-200 hover:border-blue-accent disabled:opacity-40"
                      onClick={() => moveColumn(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="w-6 rounded border border-blue-border text-xs text-gray-200 hover:border-blue-accent disabled:opacity-40"
                      onClick={() => moveColumn(index, 1)}
                      disabled={index === columns.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="w-6 rounded border border-blue-border text-xs text-red-300 hover:border-red-400 hover:text-red-200"
                      onClick={() => handleRemoveColumn(index)}
                      title="Remove column"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-blue-border px-4 py-3 bg-blue-bg">
          <button
            className="px-4 py-1.5 text-xs rounded border border-blue-border bg-blue-surface/40 text-blue-text hover:bg-blue-surface/70 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 text-xs rounded bg-blue-accent text-white hover:bg-blue-accent-hover"
            onClick={() => onSave({ name, instrumentId, noteTemplate, columns })}
          >
            Save
          </button>
        </div>
      </div>
      {editingColumnIndex !== null && columns[editingColumnIndex] && (
        <ColumnConfigModal
          column={columns[editingColumnIndex]}
          onClose={() => setEditingColumnIndex(null)}
          onSave={handleColumnConfigSave}
        />
      )}
    </div>
  );
}

function focusCell(
  gridRef: React.RefObject<HTMLTableElement | null>,
  track: number,
  col: number,
  step: number,
) {
  const cell = gridRef.current?.querySelector<HTMLInputElement>(
    `[data-track="${track}"][data-col="${col}"][data-step="${step}"]`,
  );
  cell?.focus();
  cell?.select();
}

export default function TrackerScoreObjectEditor({
  document: scoreDocument,
  onPatch,
}: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = scoreDocument.editor;
  if (editor.kind !== 'tracker') return <></>;

  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(null);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [localSteps, setLocalSteps] = useState<string>(String(editor.steps));
  const [useKeyboardNotes, setUseKeyboardNotes] = useState(editor.showNoteNames);
  const [draftCells, setDraftCells] = useState<Record<string, string>>({});
  const {
    testing,
    testOutput,
    testError,
    runTest,
    clearTestOutput,
    clearTestError,
  } = useScoreObjectTest(scoreDocument.target);
  const gridRef = useRef<HTMLTableElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const draftCellsRef = useRef<Record<string, string>>({});
  const noteCopyBuffer = useRef<NoteSnapshot[]>([]);

  const lastStepsRef = useRef(editor.steps);
  if (lastStepsRef.current !== editor.steps) {
    lastStepsRef.current = editor.steps;
    setLocalSteps(String(editor.steps));
  }

  const lastShowNoteNamesRef = useRef(editor.showNoteNames);
  if (lastShowNoteNamesRef.current !== editor.showNoteNames) {
    lastShowNoteNamesRef.current = editor.showNoteNames;
    setUseKeyboardNotes(editor.showNoteNames);
  }

  useEffect(() => {
    draftCellsRef.current = draftCells;
  }, [draftCells]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcutHelp(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const patch = useCallback(
    (p: Record<string, unknown>) => {
      onPatch({
        type: 'updateTypeSpecificEditor',
        target: scoreDocument.target,
        patch: p,
      });
    },
    [scoreDocument.target, onPatch],
  );

  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSteps(e.target.value);
  };

  const handleStepsBlur = () => {
    const v = parseInt(localSteps, 10);
    if (!isNaN(v) && v >= 1 && v <= 2048) {
      if (v !== editor.steps) {
        patch({ steps: v });
      }
    } else {
      setLocalSteps(String(editor.steps));
    }
  };

  const handleStepsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const setDraftCellValue = useCallback((key: string, value: string) => {
    setDraftCells((prev) => {
      const next = { ...prev, [key]: value };
      draftCellsRef.current = next;
      return next;
    });
  }, []);

  const clearDraftCellValue = useCallback((key: string) => {
    setDraftCells((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      draftCellsRef.current = next;
      return next;
    });
  }, []);

  const getRowFieldValue = useCallback((trackIndex: number, columnIndex: number, stepIndex: number): string => {
    const row = editor.rows[stepIndex];
    return row ? normalizeVisualOnlyTrackerValue(String(row[`track-${trackIndex}-col-${columnIndex}`] ?? '')) : '';
  }, [editor.rows]);

  const commitCellEdit = useCallback((
    trackIndex: number,
    columnIndex: number,
    stepIndex: number,
    liveValue?: string,
  ) => {
    if (columnIndex < 0) return;
    const key = getCellKey(trackIndex, columnIndex, stepIndex);
    const draft = liveValue ?? draftCellsRef.current[key];
    if (draft === undefined) return;

    const track = editor.tracks[trackIndex];
    const colDef = track?.columns?.[columnIndex];
    const currentValue = getRowFieldValue(trackIndex, columnIndex, stepIndex);
    const proposed = normalizeVisualOnlyTrackerValue(draft);
    const valid = colDef ? isTrackerValueValid(proposed, colDef) : true;

    // Java parity: invalid edits never commit and should revert to last good value.
    if (!valid) {
      clearDraftCellValue(key);
      return;
    }

    if (proposed !== currentValue) {
      patch({ updateTrackCell: { trackIndex, columnIndex, stepIndex, value: proposed } });
    }
    clearDraftCellValue(key);
  }, [clearDraftCellValue, editor.tracks, getRowFieldValue, patch]);

  const handleCellChange = useCallback(
    (trackIndex: number, columnIndex: number, stepIndex: number, value: string) => {
      const key = getCellKey(trackIndex, columnIndex, stepIndex);
      setDraftCellValue(key, value);
    },
    [setDraftCellValue],
  );

  const handleAddTrack = useCallback(() => {
    patch({ addTrack: true });
  }, [patch]);

  const handleRemoveTrack = useCallback(
    (index?: number) => {
      const idx = index !== undefined ? index : selectedTrack;
      if (editor.tracks.length === 0) return;
      patch({ removeTrack: idx });
    },
    [editor.tracks.length, selectedTrack, patch],
  );

  const handleDuplicateTrack = useCallback(
    (index: number) => {
      patch({ duplicateTrack: index });
    },
    [patch],
  );

  const handleClearTrack = useCallback(
    (index: number) => {
      patch({ clearTrack: index });
    },
    [patch],
  );

  const handleStepsPerBeatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v >= 1 && v <= 64) patch({ stepsPerBeat: v });
    },
    [patch],
  );

  const handleOctaveChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v >= -8 && v <= 8) patch({ octave: v });
    },
    [patch],
  );

  const readNoteFromRow = useCallback(
    (trackIndex: number, stepIndex: number): NoteSnapshot => {
      const row = editor.rows[stepIndex];
      const track = editor.tracks[trackIndex];
      const fields: string[] = [];
      if (track && row) {
        const numCols = track.columns?.length ?? 0;
        for (let ci = 0; ci < numCols; ci++) {
          fields.push(normalizeVisualOnlyTrackerValue(String(row[`track-${trackIndex}-col-${ci}`] ?? '')));
        }
      }
      const status = row ? String(row[`track-${trackIndex}-status`] ?? '') : '';
      return {
        tied: status === '-',
        off: status === 'OFF',
        fields,
      };
    },
    [editor.rows, editor.tracks],
  );
  const toTrackerActionBuffer = useCallback(
    (notes: NoteSnapshot[]): Array<Array<NoteSnapshot>> =>
      notes.map((note) => [{
        tied: note.tied,
        off: note.off,
        fields: [...note.fields],
      }]),
    [],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      trackIndex: number,
      columnIndex: number,
      stepIndex: number,
    ) => {
      const totalSteps = editor.rows.length;
      const mod = e.metaKey || e.ctrlKey;
      const keyLower = e.key.toLowerCase();

      if (!mod && e.key === '?') {
        e.preventDefault();
        setShowShortcutHelp(true);
        return;
      }

      if (e.key === 'Enter') {
        if (columnIndex >= 0) {
          commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
        }
        e.preventDefault();
        (e.currentTarget as HTMLInputElement).blur();
        return;
      }

      if (e.key === 'Escape') {
        if (columnIndex >= 0) {
          clearDraftCellValue(getCellKey(trackIndex, columnIndex, stepIndex));
          e.preventDefault();
          (e.currentTarget as HTMLInputElement).blur();
        }
        return;
      }

      if (mod && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        patch({
          trackerAction: {
            type: 'setNoteOff',
            trackIndex,
            stepIndex,
            columnIndex,
          },
        });
        return;
      }

      if (mod && e.code === 'Space') {
        e.preventDefault();
        patch({
          trackerAction: {
            type: 'clearOrDuplicate',
            trackIndex,
            stepIndex,
            columnIndex,
          },
        });
        return;
      }

      if (mod && e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        const newOct = Math.min(8, editor.octave + 1);
        patch({ octave: newOct });
        return;
      }

      if (mod && e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        const newOct = Math.max(-8, editor.octave - 1);
        patch({ octave: newOct });
        return;
      }

      if (mod && e.key === 'ArrowUp') {
        e.preventDefault();
        if (columnIndex >= 0) {
          const cellKey = getCellKey(trackIndex, columnIndex, stepIndex);
          clearDraftCellValue(cellKey);
          patch({
            trackerAction: {
              type: 'incrementValue',
              trackIndex,
              stepIndex,
              columnIndex,
            },
          });
        }
        return;
      }

      if (mod && e.key === 'ArrowDown') {
        e.preventDefault();
        if (columnIndex >= 0) {
          const cellKey = getCellKey(trackIndex, columnIndex, stepIndex);
          clearDraftCellValue(cellKey);
          patch({
            trackerAction: {
              type: 'decrementValue',
              trackIndex,
              stepIndex,
              columnIndex,
            },
          });
        }
        return;
      }

      if (mod && keyLower === 't') {
        e.preventDefault();
        patch({
          trackerAction: {
            type: 'toggleTie',
            trackIndex,
            stepIndex,
            columnIndex,
          },
        });
        return;
      }

      if (mod && keyLower === 'x') {
        e.preventDefault();
        const copyBuffer = [readNoteFromRow(trackIndex, stepIndex)];
        noteCopyBuffer.current = copyBuffer;
        patch({
          trackerAction: {
            type: 'cutNotes',
            trackIndex,
            stepIndex,
            columnIndex,
            noteBuffer: toTrackerActionBuffer(copyBuffer),
          },
        });
        return;
      }

      if (mod && keyLower === 'c') {
        e.preventDefault();
        noteCopyBuffer.current = [readNoteFromRow(trackIndex, stepIndex)];
        return;
      }

      if (mod && keyLower === 'v') {
        e.preventDefault();
        const buf = noteCopyBuffer.current;
        if (buf.length > 0) {
          patch({
            trackerAction: {
              type: 'pasteNotes',
              trackIndex,
              stepIndex,
              columnIndex,
              noteBuffer: toTrackerActionBuffer(buf),
            },
          });
        }
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        patch({
          trackerAction: {
            type: 'deleteNote',
            trackIndex,
            stepIndex,
            columnIndex,
          },
        });
        if (stepIndex < totalSteps - 2) {
          setTimeout(() => focusCell(gridRef, trackIndex, columnIndex, stepIndex + 1), 0);
        }
        return;
      }

      if (mod && keyLower === 'k') {
        e.preventDefault();
        const newVal = !useKeyboardNotes;
        setUseKeyboardNotes(newVal);
        patch({ showNoteNames: newVal });
        return;
      }

      if (useKeyboardNotes && !mod && !e.altKey && columnIndex >= 0) {
        const track = editor.tracks[trackIndex];
        const colDef = track?.columns?.[columnIndex];
        const entry = KEYBOARD_NOTE_MAP.find(([k]) => k === keyLower);
        if (entry) {
          if (!colDef) {
            e.preventDefault();
            return;
          }
          const colType = colDef.type;
          if (colType !== COL_TYPE_PCH && colType !== COL_TYPE_BLUE_PCH && colType !== COL_TYPE_MIDI) {
            // Match Java tracker behavior: mapped note keys are consumed while keyboard mode is on.
            e.preventDefault();
            return;
          }
          e.preventDefault();
          clearDraftCellValue(getCellKey(trackIndex, columnIndex, stepIndex));
          const value = computeKeyboardNoteValue(entry[1], editor.octave, colDef);
          if (value !== null) {
            patch({
              trackerAction: {
                type: 'setNoteValue',
                trackIndex,
                stepIndex,
                columnIndex,
                noteBuffer: [[{ tied: false, off: false, fields: [value] }]],
              },
            });
            if (stepIndex < totalSteps - 2) {
              setTimeout(() => focusCell(gridRef, trackIndex, columnIndex, stepIndex + 1), 0);
            }
          }
          return;
        }
        if (colDef) {
          const colType = colDef.type;
          if (colType === COL_TYPE_PCH || colType === COL_TYPE_BLUE_PCH || colType === COL_TYPE_MIDI) {
            if (e.key.length === 1) {
              e.preventDefault();
              return;
            }
          }
        }
      }

      let nextStep = stepIndex;
      let nextTrack = trackIndex;
      let nextCol = columnIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (columnIndex >= 0) commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
          nextStep = Math.max(0, stepIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (columnIndex >= 0) commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
          nextStep = Math.min(totalSteps - 1, stepIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (columnIndex >= 0) commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
          nextCol = columnIndex - 1;
          if (nextCol < -1) {
            if (trackIndex > 0) {
              nextTrack = trackIndex - 1;
              const prevTrackCols = editor.tracks[nextTrack].columns?.length ?? 0;
              nextCol = prevTrackCols - 1;
            } else {
              nextCol = -1;
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (columnIndex >= 0) commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
          nextCol = columnIndex + 1;
          const currentTrackCols = editor.tracks[trackIndex].columns?.length ?? 0;
          if (nextCol >= currentTrackCols) {
            if (trackIndex < editor.tracks.length - 1) {
              nextTrack = trackIndex + 1;
              nextCol = -1;
            } else {
              nextCol = currentTrackCols - 1;
            }
          }
          break;
        case 'Tab':
          if (columnIndex >= 0) commitCellEdit(trackIndex, columnIndex, stepIndex, e.currentTarget.value);
          return;
        default:
          return;
      }

      focusCell(gridRef, nextTrack, nextCol, nextStep);
    },
    [
      editor.rows.length,
      editor.tracks,
      editor.octave,
      useKeyboardNotes,
      clearDraftCellValue,
      commitCellEdit,
      readNoteFromRow,
      toTrackerActionBuffer,
      setShowShortcutHelp,
      patch,
    ],
  );

  const handleSelectTrack = useCallback((index: number) => {
    setSelectedTrack(index);
  }, []);

  const handleEditTrackProperties = useCallback((index: number) => {
    setEditingTrackIndex(index);
  }, []);

  const handleSaveTrackProperties = useCallback(
    (props: {
      name: string;
      instrumentId: string;
      noteTemplate: string;
      columns: TrackerColumnSnapshot[];
    }) => {
      if (editingTrackIndex !== null) {
        patch({
          updateTrackProperties: {
            trackIndex: editingTrackIndex,
            ...props,
          },
        });
      }
      setEditingTrackIndex(null);
    },
    [editingTrackIndex, patch],
  );

  const spb = editor.stepsPerBeat;

  return (
    <div ref={rootRef} className="flex flex-col h-full bg-blue-bg select-none">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-blue-border shrink-0 flex-wrap bg-blue-bg">

        <button
          className="px-2 py-0.5 text-[11px] font-medium rounded border border-blue-border text-blue-muted hover:bg-blue-border/30"
          onClick={handleAddTrack}
          title="Add a new track"
        >
          + TRACK
        </button>
        <div className="w-px h-4 bg-blue-border" />
        <label className="flex items-center gap-1.5 text-[11px] text-blue-muted font-medium">
          <span>STEPS</span>
          <input
            type="number"
            min={1}
            max={2048}
            className="w-16 rounded border border-blue-border bg-black/20 px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
            value={localSteps}
            onChange={handleStepsChange}
            onBlur={handleStepsBlur}
            onKeyDown={handleStepsKeyDown}
          />
        </label>
        <div className="w-px h-4 bg-blue-border" />
        <label className="flex items-center gap-1.5 text-[11px] text-blue-muted font-medium">
          <span>Steps per beat</span>
          <input
            type="number"
            min={1}
            max={64}
            className="w-12 rounded border border-blue-border bg-black/20 px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
            value={spb}
            onChange={handleStepsPerBeatChange}
            title="STEPS PER BEAT"
          />
        </label>
        <div className="w-px h-4 bg-blue-border" />
        <label className="flex items-center gap-1.5 text-[11px] text-blue-muted font-medium cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-blue-border bg-black/20 text-blue-accent focus:ring-0"
            checked={useKeyboardNotes}
            onChange={(e) => {
              setUseKeyboardNotes(e.target.checked);
              patch({ showNoteNames: e.target.checked });
            }}
          />
          <span>USE KEYBOARD NOTES</span>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-blue-muted font-medium">
          <span>OCTAVE</span>
          <input
            type="number"
            min={-8}
            max={8}
            className="w-12 rounded border border-blue-border bg-black/20 px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
            value={editor.octave}
            onChange={handleOctaveChange}
          />
        </label>
        <div className="w-px h-4 bg-blue-border" />
        <button
          className="ml-auto px-3 py-0.5 text-[11px] font-bold rounded bg-blue-accent/20 text-blue-accent border border-blue-accent/40 hover:bg-blue-accent/30 disabled:opacity-40"
          disabled={!editor.canTest || testing}
          onClick={() => { void runTest(); }}
          title="Generate score from tracker and show results"
        >
          {testing ? 'TESTING...' : 'TEST'}
        </button>
        <button
          className="flex items-center justify-center w-6 h-6 rounded-full border border-blue-border text-blue-muted hover:text-blue-accent hover:border-blue-accent/60 hover:bg-blue-accent/10 transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
          onClick={() => setShowShortcutHelp(true)}
        >
          <span className="text-[11px] font-bold leading-none">?</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-black/10">
        {editor.tracks.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-xs text-blue-muted">
            No tracks -- click "+ TRACK" to add one
          </div>
        ) : (
          <table
            ref={gridRef}
            className="border-collapse text-[11px] w-auto"
            style={{ tableLayout: 'fixed' }}
          >
            <colgroup><col style={{ width: 44 }} />{editor.tracks.map((t) => [<col key={`${t.trackId}-status`} style={{ width: 24 }} />, ...(t.columns ?? []).map((_, ci) => <col key={`${t.trackId}-col-${ci}`} style={{ width: 64 }} />)])}</colgroup>
            <thead className="sticky top-0 z-20 bg-blue-bg">
              <tr className="border-b border-blue-border">
                <th className="px-1 py-1 text-center text-blue-muted font-bold border-r border-blue-border/40"></th>
                {editor.tracks.map((track, ti) => (
                  <ContextMenu.Root key={track.trackId}>
                    <ContextMenu.Trigger asChild>
                      <th
                        colSpan={1 + (track.columns?.length ?? 0)}
                        className={`px-1 py-1.5 text-center font-bold cursor-pointer select-none overflow-hidden text-ellipsis whitespace-nowrap border-r border-blue-border/40 transition-colors ${
                          ti === selectedTrack
                            ? 'text-blue-accent bg-blue-accent/5'
                            : 'text-blue-muted hover:bg-blue-border/10'
                        }`}
                        onClick={() => handleSelectTrack(ti)}
                        title={`${track.trackName} (Right-click for options)`}
                      >
                        {track.trackName}
                      </th>
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal>
                      <ContextMenu.Content className="min-w-[180px] bg-[#1e293b] border border-blue-border/50 rounded-md p-1 shadow-2xl z-50">
                        <ContextMenu.Item
                          className="flex items-center px-2 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent hover:text-white outline-none cursor-default"
                          onSelect={() => handleDuplicateTrack(ti)}
                        >
                          Duplicate
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="flex items-center px-2 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent hover:text-white outline-none cursor-default"
                          onSelect={() => handleClearTrack(ti)}
                        >
                          Clear
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="flex items-center px-2 py-1.5 text-xs text-red-300 rounded hover:bg-red-600 hover:text-white outline-none cursor-default"
                          onSelect={() => handleRemoveTrack(ti)}
                        >
                          Remove
                        </ContextMenu.Item>
                        <ContextMenu.Separator className="h-px bg-blue-border/50 my-1" />
                        <ContextMenu.Item
                          className="flex items-center px-2 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent hover:text-white outline-none cursor-default"
                          onSelect={() => handleEditTrackProperties(ti)}
                        >
                          Edit Track Properties...
                        </ContextMenu.Item>
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                ))}
              </tr>
              <tr className="border-b border-blue-border/60 bg-blue-bg/40 text-[9px] text-blue-muted/70 uppercase">
                <th className="px-1 py-0.5 font-bold border-r border-blue-border/40">Step</th>
                {editor.tracks.map((track) => (
                  <React.Fragment key={track.trackId}>
                    <th className="px-0 py-0.5 text-center border-r border-blue-border/20">T</th>
                    {(track.columns ?? []).map((col, ci) => (
                      <th
                        key={ci}
                        className="px-1 py-0.5 text-center font-medium border-r border-blue-border/20 overflow-hidden text-ellipsis whitespace-nowrap"
                        title={col.name}
                      >
                        {col.name}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {editor.rows.map((row, ri) => {
                const isBeatStart = ri % spb === 0;
                return (
                  <tr
                    key={ri}
                    className={`group ${
                      isBeatStart
                        ? 'border-t border-blue-border/30 bg-blue-accent/5'
                        : 'border-b border-blue-border/5 hover:bg-blue-border/5'
                    }`}
                  >
                    <td
                      className={`px-1 py-0.5 font-mono text-[10px] text-center sticky left-0 bg-[#0d1524] z-10 border-r border-blue-border/40 ${
                        isBeatStart ? 'text-gray-100 font-bold' : 'text-gray-500'
                      }`}
                    >
                      {ri < 10 ? `0${ri}` : ri}
                    </td>
                    {editor.tracks.map((track, ti) => {
                      const statusVal = String(row[`track-${ti}-status`] ?? '');
                      return (
                        <React.Fragment key={track.trackId}>
                          <td className="px-0 py-0 border-r border-blue-border/20">
                            <input
                              type="text"
                              data-track={ti}
                              data-col={-1}
                              data-step={ri}
                              className={`w-full bg-transparent px-0 py-0.5 text-[10px] font-bold font-mono focus:bg-blue-accent/20 focus:outline-none text-center border-0 ${
                                statusVal === '-'
                                  ? 'text-blue-accent'
                                  : statusVal === 'OFF'
                                  ? 'text-red-400'
                                  : 'text-gray-600'
                              }`}
                              value={statusVal}
                              placeholder="."
                              readOnly
                              onKeyDown={(e) => handleKeyDown(e, ti, -1, ri)}
                              spellCheck={false}
                            />
                          </td>
                          {(track.columns ?? []).map((colDef, ci) => {
                            const cellValue = statusVal === 'OFF'
                              ? 'OFF'
                              : normalizeVisualOnlyTrackerValue(String(row[`track-${ti}-col-${ci}`] ?? ''));
                            const key = getCellKey(ti, ci, ri);
                            const draftValue = draftCells[key];
                            const shownValue = draftValue ?? cellValue;
                            const isInvalid = draftValue !== undefined && !isTrackerValueValid(draftValue, colDef);
                            return (
                              <td key={ci} className="px-0 py-0 border-r border-blue-border/20">
                                <input
                                  type="text"
                                  data-track={ti}
                                  data-col={ci}
                                  data-step={ri}
                                  className={`w-full bg-transparent px-1 py-0.5 text-xs font-mono focus:bg-blue-accent/20 focus:outline-none text-center border-0 text-gray-200 ${isInvalid ? 'outline outline-1 outline-red-500' : ''}`}
                                  value={shownValue}
                                  placeholder={ci === 0 ? '...' : '---'}
                                  readOnly={statusVal === 'OFF'}
                                  onFocus={(e) => {
                                    const current = e.currentTarget.value.trim();
                                    if (current === '...' || current === '---') {
                                      handleCellChange(ti, ci, ri, '');
                                    }
                                  }}
                                  onChange={(e) => handleCellChange(ti, ci, ri, e.target.value)}
                                  onBlur={(e) => commitCellEdit(ti, ci, ri, e.currentTarget.value)}
                                  onKeyDown={(e) => handleKeyDown(e, ti, ci, ri)}
                                  spellCheck={false}
                                />
                              </td>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {testError && (
        <div className="px-3 py-1.5 text-xs border-b shrink-0 bg-red-900/20 text-red-300 flex items-center gap-2">
          <span>Error: {testError}</span>
          <button className="underline text-blue-muted hover:text-gray-200" onClick={clearTestError}>dismiss</button>
        </div>
      )}

      {editingTrackIndex !== null && (
        <TrackPropertiesModal
          track={editor.tracks[editingTrackIndex]}
          onClose={() => setEditingTrackIndex(null)}
          onSave={handleSaveTrackProperties}
        />
      )}
      {showShortcutHelp && (
        <ShortcutHelpModal onClose={() => setShowShortcutHelp(false)} />
      )}
      {testOutput !== null && (
        <GeneratedScoreModal text={testOutput} onClose={clearTestOutput} />
      )}
    </div>
  );
}
