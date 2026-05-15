import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import type { FieldDefSnapshot, NoteData, PianoRollPayload } from './pianoroll/types';
import {
  applyPianoRollPatchToPayload,
  buildPianoRollRestorePatch,
  clonePianoRollPayload,
  GENERATE_FREQUENCY,
  GENERATE_MIDI,
  GENERATE_PCH,
  MIDI_NOTE_COUNT,
  OCTAVES,
  PITCH_HEADER_WIDTH,
  getSnapBeats,
} from './pianoroll/types';
import { usePianoRollClipboardStore } from '../../../../../stores/pianoroll-clipboard-store';
import { useProjectStore } from '../../../../../stores/project-store';
import { usePianoRollUndoStore } from './pianoroll/pianoroll-undo-store';
import PianoRollCanvas from './pianoroll/PianoRollCanvas';
import PitchHeader from './pianoroll/PitchHeader';
import TimeBar, { getPianoRollRulerHeight } from './pianoroll/TimeBar';
import FieldEditor from './pianoroll/FieldEditor';
import FieldSelectorView from './pianoroll/FieldSelectorView';
import NotePropertiesEditor from './pianoroll/NotePropertiesEditor';
import PianoRollSnapButton from './pianoroll/PianoRollSnapButton';
import PianoRollPropertiesEditor from './pianoroll/PianoRollPropertiesEditor';
import PianoRollRulerConfigDialog, { type PianoRollRulerConfigChanges } from './pianoroll/PianoRollRulerConfigDialog';
import SplitPane from '../../orchestra/SplitPane';
import { NoteCanvasMouseListener } from './pianoroll/NoteCanvasMouseListener';
import type { SnapValueName } from '@blue/data';

type Tab = 'notes' | 'properties';

interface PasteTarget {
  startBeat: number;
  octave: number;
  scaleDegree: number;
}

export default function PianoRollEditor({ document: scoreDocument, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = scoreDocument.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'PianoRoll') return <></>;

  const payload = editor.payload as unknown as PianoRollPayload;
  const {
    noteTemplate, pchGenerationMethod,
    pixelSecond: initialPixelSecond, noteHeight: initialNoteHeight, snapEnabled: initialSnapEnabled,
    scale, fieldDefinitions, notes,
  } = payload;

  const durationBeats = scoreDocument.shared.subjectiveDuration.value;

  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [selectedFieldDef, setSelectedFieldDef] = useState<FieldDefSnapshot | null>(
    fieldDefinitions.length > 0 ? fieldDefinitions[0]! : null
  );
  const [snapEnabled, setSnapEnabled] = useState(initialSnapEnabled);
  const [snapValue, setSnapValue] = useState<SnapValueName>(payload.snapValue ?? 'SIXTEENTH');
  const [pixelSecond, setPixelSecond] = useState(initialPixelSecond || 64);
  const [noteHeight, setNoteHeight] = useState(initialNoteHeight || 15);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [pasteTarget, setPasteTarget] = useState<PasteTarget | null>(null);
  const [rulerDialogOpen, setRulerDialogOpen] = useState(false);
  const [testScoreText, setTestScoreText] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const redraw = useCallback(() => forceUpdate((n) => n + 1), []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const centeredTargetRef = useRef<string | null>(null);

  const clipboard = usePianoRollClipboardStore((s) => s.clipboard);
  const setClipboard = usePianoRollClipboardStore((s) => s.setClipboard);
  const pushUndoEdit = usePianoRollUndoStore((s) => s.pushEdit);
  const undo = usePianoRollUndoStore((s) => s.undo);
  const redo = usePianoRollUndoStore((s) => s.redo);
  const clearUndoHistory = usePianoRollUndoStore((s) => s.clear);
  const scoreTimeState = useProjectStore((s) => s.score.timeState);

  const snapBeats = useMemo(() => getSnapBeats(snapEnabled, snapValue, pixelSecond), [snapEnabled, snapValue, pixelSecond]);
  const effectivePrimaryTimeDisplay = payload.useGlobalRuler ? scoreTimeState.primaryTimeDisplay : payload.primaryTimeDisplay;
  const effectiveSecondaryTimeDisplay = payload.useGlobalRuler ? scoreTimeState.secondaryTimeDisplay : payload.secondaryTimeDisplay;
  const effectiveSecondaryRulerEnabled = payload.useGlobalRuler ? scoreTimeState.secondaryRulerEnabled : payload.secondaryRulerEnabled;
  const rulerHeight = getPianoRollRulerHeight(effectiveSecondaryRulerEnabled);
  const targetKey = useMemo(() => JSON.stringify(scoreDocument.target), [scoreDocument.target]);
  const selectedFieldIndex = useMemo(() => {
    if (!selectedFieldDef) return -1;
    return fieldDefinitions.findIndex((fd) => fd.fieldName === selectedFieldDef.fieldName);
  }, [fieldDefinitions, selectedFieldDef]);

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({ type: 'updateTypeSpecificEditor', target: scoreDocument.target, patch: p });
  }, [scoreDocument.target, onPatch]);

  const commitUndoablePatch = useCallback((nextPatch: Record<string, unknown>, label: string) => {
    const previousPayload = clonePianoRollPayload(payload);
    const nextPayload = applyPianoRollPatchToPayload(previousPayload, nextPatch);

    if (JSON.stringify(previousPayload) === JSON.stringify(nextPayload)) {
      return;
    }

    patch(nextPatch);
    pushUndoEdit({
      label,
      undo: () => patch(buildPianoRollRestorePatch(previousPayload)),
      redo: () => patch(buildPianoRollRestorePatch(nextPayload)),
    });
  }, [patch, payload, pushUndoEdit]);

  useEffect(() => {
    setSnapEnabled(initialSnapEnabled);
  }, [initialSnapEnabled]);

  useEffect(() => {
    setSnapValue(payload.snapValue ?? 'SIXTEENTH');
  }, [payload.snapValue]);

  useEffect(() => {
    setPixelSecond(initialPixelSecond || 64);
  }, [initialPixelSecond]);

  useEffect(() => {
    setNoteHeight(initialNoteHeight || 15);
  }, [initialNoteHeight]);

  useEffect(() => {
    setSelectedFieldDef((current) => {
      if (fieldDefinitions.length === 0) return null;
      if (current) {
        const next = fieldDefinitions.find((fd) => fd.fieldName === current.fieldName);
        if (next) return next;
      }
      return fieldDefinitions[0]!;
    });
  }, [fieldDefinitions]);

  useEffect(() => {
    clearUndoHistory();
    setSelectedIndices(new Set());
    setPasteTarget(null);
  }, [clearUndoHistory, targetKey]);

  const handleAddNote = useCallback((start: number, scaleDegree: number, octave: number, duration = 1) => {
    const fieldValues = fieldDefinitions.map((fd) => fd.defaultValue);
    commitUndoablePatch({ pianoRollNoteBatch: { operations: [{ kind: 'add', note: { octave, scaleDegree, start, duration, fieldValues } }] } }, 'Add note');
  }, [commitUndoablePatch, fieldDefinitions]);

  const handleCommitNoteTimeEdit = useCallback((_originalData: NoteData[], endData: NoteData[]) => {
    commitUndoablePatch({
      pianoRollNoteBatch: {
        operations: endData.map((end) => {
          return {
            kind: 'update' as const,
            noteIndex: end.noteIndex,
            note: { ...notes[end.noteIndex]!, start: end.originStart, duration: end.originDuration, octave: end.octave, scaleDegree: end.scaleDegree },
          };
        }),
      },
    }, 'Edit notes');
  }, [commitUndoablePatch, notes]);

  const handleCommitFieldValues = useCallback((noteIndices: number[], fieldIndex: number, values: number[]) => {
    const operations = noteIndices.flatMap((noteIndex, i) => {
      const note = notes[noteIndex];
      if (!note) return [];
      const fieldValues = [...note.fieldValues];
      fieldValues[fieldIndex] = values[i] ?? fieldValues[fieldIndex] ?? 0;
      return [{
        kind: 'update' as const,
        noteIndex,
        note: { ...note, fieldValues },
      }];
    });
    if (operations.length > 0) {
      commitUndoablePatch({ pianoRollNoteBatch: { operations } }, 'Edit field values');
    }
  }, [commitUndoablePatch, notes]);

  const handleCommitFieldEdit = useCallback((noteIndices: number[], fieldIndex: number, _originalValues: number[], endValues: number[]) => {
    handleCommitFieldValues(noteIndices, fieldIndex, endValues);
  }, [handleCommitFieldValues]);

  const handleRemoveSelectedNotes = useCallback(() => {
    if (selectedIndices.size === 0) return;
    commitUndoablePatch({ pianoRollNoteBatch: { operations: [{ kind: 'remove', noteIndices: [...selectedIndices] }] } }, 'Remove notes');
    setSelectedIndices(new Set());
  }, [commitUndoablePatch, selectedIndices]);

  const handleCopySelectedNotes = useCallback(() => {
    if (selectedIndices.size === 0) return;
    const selectedNotes = [...selectedIndices].map((i) => notes[i]).filter(Boolean);
    if (selectedNotes.length === 0) return;
    const minStart = Math.min(...selectedNotes.map((n) => n.start));
    const nd = pchGenerationMethod === GENERATE_MIDI ? 12 : (scale.ratios.length || 12);
    const anchor = selectedNotes[0]!;
    setClipboard({
      sourceStartBeats: minStart,
      sourceScaleDegrees: selectedNotes.map((n) => n.scaleDegree),
      sourcePitchIndex: anchor.octave * nd + anchor.scaleDegree,
      notes: selectedNotes.map((n) => ({
        octave: n.octave, scaleDegree: n.scaleDegree,
        start: n.start - minStart, duration: n.duration,
        fieldValues: [...n.fieldValues],
      })),
    });
  }, [selectedIndices, notes, setClipboard, pchGenerationMethod, scale.ratios]);

  const handleCutSelectedNotes = useCallback(() => {
    handleCopySelectedNotes();
    handleRemoveSelectedNotes();
  }, [handleCopySelectedNotes, handleRemoveSelectedNotes]);

  const handlePasteNotesAt = useCallback((startBeat: number, octave: number, scaleDegree: number) => {
    if (!clipboard || clipboard.notes.length === 0) return;
    const nd = pchGenerationMethod === GENERATE_MIDI ? 12 : (scale.ratios.length || 12);
    const srcBaseDegree = clipboard.sourceScaleDegrees[0] ?? 0;
    const sourcePitchIndex = clipboard.sourcePitchIndex ?? (8 * nd + srcBaseDegree);
    const targetPitchIndex = octave * nd + scaleDegree;
    const deltaPitchIndex = targetPitchIndex - sourcePitchIndex;
    commitUndoablePatch({
      pianoRollNoteBatch: {
        operations: [{
          kind: 'addMany',
          notes: clipboard.notes.map((n) => {
            const pitchIndex = n.octave * nd + n.scaleDegree + deltaPitchIndex;
            return {
              octave: Math.floor(pitchIndex / nd),
              scaleDegree: ((pitchIndex % nd) + nd) % nd,
              start: n.start + startBeat,
              duration: n.duration,
              fieldValues: [...n.fieldValues],
            };
          }),
        }],
      },
    }, 'Paste notes');
  }, [clipboard, commitUndoablePatch, scale.ratios, pchGenerationMethod]);

  const handlePasteAtLastTarget = useCallback(() => {
    const target = pasteTarget ?? { startBeat: 0, octave: 8, scaleDegree: 0 };
    handlePasteNotesAt(target.startBeat, target.octave, target.scaleDegree);
  }, [handlePasteNotesAt, pasteTarget]);

  const handleSnapToggle = useCallback(() => {
    const next = !snapEnabled;
    setSnapEnabled(next);
    patch({ snapEnabled: next });
  }, [patch, snapEnabled]);

  const handleSnapValueChange = useCallback((value: SnapValueName) => {
    setSnapValue(value);
    patch({ snapValue: value });
  }, [patch]);

  const handleRulerConfigApply = useCallback((changes: PianoRollRulerConfigChanges) => {
    patch({ ...changes });
  }, [patch]);

  const listenerRef = useRef<NoteCanvasMouseListener | null>(null);
  if (!listenerRef.current) {
    listenerRef.current = new NoteCanvasMouseListener({
      get notes() { return notes; },
      get scale() { return scale; },
      get fieldDefinitions() { return fieldDefinitions; },
      get selectedIndices() { return selectedIndices; },
      get pixelSecond() { return pixelSecond; },
      get noteHeight() { return noteHeight; },
      get snapEnabled() { return snapEnabled; },
      get snapBeats() { return snapBeats; },
      get durationBeats() { return durationBeats; },
      get selectedFieldDef() { return selectedFieldDef; },
      get pchGenerationMethod() { return pchGenerationMethod; },
      addNote: handleAddNote,
      commitNoteTimeEdit: handleCommitNoteTimeEdit,
      commitFieldEdit: handleCommitFieldEdit,
      removeSelectedNotes: handleRemoveSelectedNotes,
      copySelectedNotes: handleCopySelectedNotes,
      cutSelectedNotes: handleCutSelectedNotes,
      pasteNotesAt: handlePasteNotesAt,
      setPasteTarget,
      setSelection: (indices) => setSelectedIndices(indices),
      addToSelection: (idx) => setSelectedIndices((prev) => new Set([...prev, idx])),
      removeFromSelection: (idx) => setSelectedIndices((prev) => { const n = new Set(prev); n.delete(idx); return n; }),
      clearSelection: () => setSelectedIndices(new Set()),
      requestRedraw: redraw,
      getCanvasRect: () => canvasRef.current?.getBoundingClientRect() ?? null,
      getViewportRect: () => scrollRef.current?.getBoundingClientRect() ?? null,
      getScrollPosition: () => ({ scrollLeft: scrollRef.current?.scrollLeft ?? 0, scrollTop: scrollRef.current?.scrollTop ?? 0 }),
      getViewportSize: () => ({ width: scrollRef.current?.clientWidth ?? 0, height: scrollRef.current?.clientHeight ?? 0 }),
      setScrollPosition: (left, top) => { if (scrollRef.current) { scrollRef.current.scrollLeft = left; scrollRef.current.scrollTop = top; } },
    });
  }

  useEffect(() => {
    listenerRef.current!.updateCallbacks({
      get notes() { return notes; },
      get scale() { return scale; },
      get fieldDefinitions() { return fieldDefinitions; },
      get selectedIndices() { return selectedIndices; },
      get pixelSecond() { return pixelSecond; },
      get noteHeight() { return noteHeight; },
      get snapEnabled() { return snapEnabled; },
      get snapBeats() { return snapBeats; },
      get durationBeats() { return durationBeats; },
      get selectedFieldDef() { return selectedFieldDef; },
      get pchGenerationMethod() { return pchGenerationMethod; },
      addNote: handleAddNote,
      commitNoteTimeEdit: handleCommitNoteTimeEdit,
      commitFieldEdit: handleCommitFieldEdit,
      removeSelectedNotes: handleRemoveSelectedNotes,
      copySelectedNotes: handleCopySelectedNotes,
      cutSelectedNotes: handleCutSelectedNotes,
      pasteNotesAt: handlePasteNotesAt,
      setPasteTarget,
      setSelection: (indices) => setSelectedIndices(indices),
      addToSelection: (idx) => setSelectedIndices((prev) => new Set([...prev, idx])),
      removeFromSelection: (idx) => setSelectedIndices((prev) => { const n = new Set(prev); n.delete(idx); return n; }),
      clearSelection: () => setSelectedIndices(new Set()),
      requestRedraw: redraw,
      getCanvasRect: () => canvasRef.current?.getBoundingClientRect() ?? null,
      getViewportRect: () => scrollRef.current?.getBoundingClientRect() ?? null,
      getScrollPosition: () => ({ scrollLeft: scrollRef.current?.scrollLeft ?? 0, scrollTop: scrollRef.current?.scrollTop ?? 0 }),
      getViewportSize: () => ({ width: scrollRef.current?.clientWidth ?? 0, height: scrollRef.current?.clientHeight ?? 0 }),
      setScrollPosition: (left, top) => { if (scrollRef.current) { scrollRef.current.scrollLeft = left; scrollRef.current.scrollTop = top; } },
    });
  }, [notes, scale, fieldDefinitions, selectedIndices, pixelSecond, noteHeight, snapEnabled, snapBeats, durationBeats, selectedFieldDef, handleAddNote, handleCommitNoteTimeEdit, handleCommitFieldEdit, handleRemoveSelectedNotes, handleCopySelectedNotes, handleCutSelectedNotes, handlePasteNotesAt, redraw]);

  const focusEditorSurface = useCallback((target: EventTarget | null) => {
    if (isEditableTarget(target)) return;
    rootRef.current?.focus();
  }, []);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditableTarget(e.target)) return;
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key === 'c') {
      e.preventDefault();
      e.stopPropagation();
      handleCopySelectedNotes();
    } else if (mod && e.key === 'x') {
      e.preventDefault();
      e.stopPropagation();
      handleCutSelectedNotes();
    } else if (mod && e.key === 'v') {
      e.preventDefault();
      e.stopPropagation();
      handlePasteAtLastTarget();
    } else if (mod && e.key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIndices(new Set(notes.map((_, i) => i)));
    } else if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      undo();
    } else if (mod && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      redo();
    } else if (!mod && !e.altKey && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      e.stopPropagation();
      handleRemoveSelectedNotes();
    } else if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      e.stopPropagation();
      handleSnapToggle();
    } else if (mod && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      e.stopPropagation();
      const nextPixelSecond = Math.min(512, pixelSecond + 8);
      setPixelSecond(nextPixelSecond);
      patch({ pixelSecond: nextPixelSecond });
    } else if (mod && e.key === '-') {
      e.preventDefault();
      e.stopPropagation();
      const nextPixelSecond = Math.max(16, pixelSecond - 8);
      setPixelSecond(nextPixelSecond);
      patch({ pixelSecond: nextPixelSecond });
    } else if (mod && e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const nextNoteHeight = Math.min(25, noteHeight + 1);
      setNoteHeight(nextNoteHeight);
      patch({ noteHeight: nextNoteHeight });
    } else if (mod && e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const nextNoteHeight = Math.max(5, noteHeight - 1);
      setNoteHeight(nextNoteHeight);
      patch({ noteHeight: nextNoteHeight });
    }
  }, [
    handleCopySelectedNotes,
    handleCutSelectedNotes,
    handlePasteAtLastTarget,
    handleRemoveSelectedNotes,
    handleSnapToggle,
    notes,
    noteHeight,
    patch,
    pixelSecond,
    redo,
    undo,
  ]);

  useEffect(() => {
    if (activeTab !== 'notes') return;

    const centerKey = `${targetKey}:${pchGenerationMethod}:${scale.ratios.length || 12}:${notes.length > 0 ? 'notes' : 'empty'}`;
    if (centeredTargetRef.current === centerKey) return;

    const frame = window.requestAnimationFrame(() => {
      const scroll = scrollRef.current;
      if (!scroll || scroll.clientHeight <= 0) return;

      const numDegrees = pchGenerationMethod === GENERATE_MIDI ? 12 : (scale.ratios.length || 12);
      const totalRows = pchGenerationMethod === GENERATE_MIDI ? MIDI_NOTE_COUNT : OCTAVES * numDegrees;
      const canvasHeight = totalRows * noteHeight;
      const viewportHeight = Math.max(1, scroll.clientHeight);
      let targetNoteIndex: number;

      if (notes.length > 0) {
        targetNoteIndex = notes.reduce((min, note) => {
          const noteIndex = note.octave * numDegrees + note.scaleDegree;
          return Math.min(min, noteIndex);
        }, Number.POSITIVE_INFINITY);
        targetNoteIndex += Math.floor((viewportHeight / noteHeight) / 4);
      } else if (pchGenerationMethod === GENERATE_MIDI) {
        targetNoteIndex = 8 * 12;
      } else {
        targetNoteIndex = 8 * numDegrees;
      }

      const targetY = canvasHeight - (targetNoteIndex * noteHeight);
      const maxScrollTop = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      const scrollTop = Math.max(0, Math.min(maxScrollTop, targetY - (viewportHeight / 2)));
      scroll.scrollTop = scrollTop;
      setScrollLeft(scroll.scrollLeft);
      setScrollTop(scroll.scrollTop);
      centeredTargetRef.current = centerKey;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, targetKey, pchGenerationMethod, scale.ratios.length, notes, noteHeight, rulerHeight]);

  const maxStart = notes.reduce((max, n) => Math.max(max, n.start + n.duration), durationBeats);
  const canvasWidth = Math.max(maxStart * pixelSecond + 200, 800);
  const handleCanvasScroll = useCallback(() => {
    setScrollLeft(scrollRef.current?.scrollLeft ?? 0);
    setScrollTop(scrollRef.current?.scrollTop ?? 0);
  }, []);
  const handleGenerateTest = useCallback(() => {
    setTestScoreText(generatePianoRollScorePreview(payload));
  }, [payload]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={rootRef}
          className="flex flex-col h-full bg-blue-bg select-none"
          tabIndex={0}
          onKeyDown={handleEditorKeyDown}
          onMouseDownCapture={(e) => focusEditorSurface(e.target)}
          onContextMenuCapture={(e) => focusEditorSurface(e.target)}
        >
          <div className="flex border-b border-blue-border shrink-0">
            <button
              className={`px-4 py-1.5 text-xs font-medium ${activeTab === 'notes' ? 'text-blue-accent border-b-2 border-blue-accent' : 'text-blue-muted hover:text-gray-200'}`}
              onClick={() => setActiveTab('notes')}
            >Notes</button>
            <button
              className={`px-4 py-1.5 text-xs font-medium ${activeTab === 'properties' ? 'text-blue-accent border-b-2 border-blue-accent' : 'text-blue-muted hover:text-gray-200'}`}
              onClick={() => setActiveTab('properties')}
            >Properties</button>
          </div>

          {activeTab === 'properties' && (
            <div className="flex-1 overflow-hidden">
              <PianoRollPropertiesEditor payload={payload} onPatch={patch} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 px-2 py-1 border-b border-blue-border shrink-0 bg-blue-bg">
                <NotePropertiesEditor
                  notes={notes}
                  selectedIndices={selectedIndices}
                  globalNoteTemplate={noteTemplate}
                  onPatch={(nextPatch) => commitUndoablePatch(nextPatch, 'Update note template')}
                />
                <PianoRollSnapButton
                  snapEnabled={snapEnabled}
                  snapValue={snapValue}
                  onToggleSnap={handleSnapToggle}
                  onChangeSnapValue={handleSnapValueChange}
                />
                <button
                  className="h-5.5 px-2 text-[11px] border border-blue-border/40 rounded bg-blue-surface hover:bg-blue-hover text-blue-text cursor-pointer transition-colors"
                  onClick={() => setRulerDialogOpen(true)}
                  title="Configure ruler display settings"
                >
                  Ruler
                </button>
                <button
                  className="h-5.5 px-2 text-[11px] border border-blue-border/40 rounded bg-blue-surface hover:bg-blue-hover text-blue-text cursor-pointer transition-colors"
                  onClick={handleGenerateTest}
                  title="Generate a preview score from this PianoRoll"
                >
                  Test
                </button>
              </div>

              <SplitPane
                orientation="vertical"
                ariaLabel="PianoRoll canvas and field editor splitter"
                initialSplit={0.72}
                minFirstSize={100}
                minSecondSize={40}
                first={
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex shrink-0 bg-[#10192a] border-b border-blue-border/30" style={{ height: rulerHeight }}>
                      <div className="shrink-0 border-r border-blue-border/25" style={{ width: PITCH_HEADER_WIDTH, height: rulerHeight }} />
                      <div className="relative min-w-0 flex-1 overflow-hidden" style={{ height: rulerHeight }}>
                        <div
                          className="absolute left-0 top-0"
                          style={{ width: canvasWidth, transform: `translateX(${-scrollLeft}px)` }}
                        >
                          <TimeBar
                            canvasWidth={canvasWidth}
                            pixelSecond={pixelSecond}
                            primaryTimeDisplay={effectivePrimaryTimeDisplay}
                            secondaryTimeDisplay={effectiveSecondaryTimeDisplay}
                            secondaryRulerEnabled={effectiveSecondaryRulerEnabled}
                            meters={scoreDocument.timeContext.meterEntries}
                            initialTempo={scoreDocument.timeContext.initialTempo}
                            sampleRate={scoreDocument.timeContext.sampleRate}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                      <div className="relative shrink-0 overflow-hidden border-r border-blue-border/25" style={{ width: PITCH_HEADER_WIDTH }}>
                        <div
                          className="absolute left-0 top-0"
                          style={{ transform: `translateY(${-scrollTop}px)` }}
                        >
                          <PitchHeader notes={notes} selectedIndices={selectedIndices} scale={scale} noteHeight={noteHeight} pchGenerationMethod={pchGenerationMethod} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 overflow-auto" ref={scrollRef} onScroll={handleCanvasScroll}>
                        <PianoRollCanvas
                          notes={notes}
                          previewNotes={listenerRef.current!.getPreviewNotes()}
                          scale={scale}
                          fieldDefinitions={fieldDefinitions}
                          selectedIndices={selectedIndices}
                          pixelSecond={pixelSecond}
                          noteHeight={noteHeight}
                          snapEnabled={snapEnabled}
                          snapBeats={snapBeats}
                          durationBeats={durationBeats}
                          pchGenerationMethod={pchGenerationMethod}
                          listener={listenerRef.current!}
                          canvasRef={canvasRef}
                        />
                      </div>
                    </div>
                  </div>
                }
                second={
                  <div className="flex h-full min-h-0 bg-[#0a0f1a]">
                    <div className="h-full shrink-0 border-r border-blue-border/25" style={{ width: PITCH_HEADER_WIDTH }}>
                      <FieldSelectorView
                        fieldDefinitions={fieldDefinitions}
                        selectedFieldDef={selectedFieldDef}
                        onSelectField={setSelectedFieldDef}
                      />
                    </div>
                    <div className="relative h-full flex-1 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0"
                        style={{ width: canvasWidth, transform: `translateX(${-scrollLeft}px)` }}
                      >
                        <FieldEditor
                          notes={notes}
                          selectedIndices={selectedIndices}
                          scale={scale}
                          fieldDef={selectedFieldDef}
                          fieldIndex={selectedFieldIndex}
                          pixelSecond={pixelSecond}
                          noteHeight={noteHeight}
                          width={canvasWidth}
                          onSelectionChange={setSelectedIndices}
                          onCommitFieldEdit={handleCommitFieldValues}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </ContextMenu.Trigger>
      {rulerDialogOpen && (
        <PianoRollRulerConfigDialog
          useGlobalRuler={payload.useGlobalRuler}
          primaryTimeDisplay={payload.primaryTimeDisplay}
          secondaryRulerEnabled={payload.secondaryRulerEnabled}
          secondaryTimeDisplay={payload.secondaryTimeDisplay}
          onApply={handleRulerConfigApply}
          onClose={() => setRulerDialogOpen(false)}
        />
      )}
      {testScoreText !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[min(720px,calc(100vw-48px))] max-h-[min(560px,calc(100vh-48px))] flex flex-col bg-blue-bg border border-blue-border rounded shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-blue-border/40">
              <h2 className="text-sm font-semibold text-blue-text">Generated Score</h2>
              <button
                className="h-5.5 px-2 text-[11px] border border-blue-border/40 rounded bg-blue-surface hover:bg-blue-hover text-blue-text"
                onClick={() => setTestScoreText(null)}
              >
                Close
              </button>
            </div>
            <pre className="m-0 p-3 overflow-auto text-xs leading-5 text-blue-text whitespace-pre-wrap font-mono">
              {testScoreText.length > 0 ? testScoreText : '(no notes)'}
            </pre>
          </div>
        </div>
      )}
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-40 bg-[#1e293b] border border-blue-border/50 rounded-md p-1 shadow-2xl z-50">
          <ContextMenu.Item className="px-3 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent/20 hover:text-blue-accent cursor-pointer outline-none" onSelect={handleCopySelectedNotes}>Copy</ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent/20 hover:text-blue-accent cursor-pointer outline-none" onSelect={handleCutSelectedNotes}>Cut</ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent/20 hover:text-blue-accent cursor-pointer outline-none" onSelect={handlePasteAtLastTarget}>Paste</ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-blue-border/30 my-1" />
          <ContextMenu.Item className="px-3 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent/20 hover:text-blue-accent cursor-pointer outline-none" onSelect={handleRemoveSelectedNotes}>Remove</ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 text-xs text-gray-200 rounded hover:bg-blue-accent/20 hover:text-blue-accent cursor-pointer outline-none" onSelect={() => setSelectedIndices(new Set(notes.map((_, i) => i)))}>Select All</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function generatePianoRollScorePreview(payload: PianoRollPayload): string {
  const instrumentId = payload.instrumentId.trim();
  const instrReplacement = isIntegerText(instrumentId) ? instrumentId : `"${instrumentId}"`;
  const numScaleDegrees = payload.pchGenerationMethod === GENERATE_MIDI
    ? 12
    : (payload.scale.ratios.length || 12);

  return [...payload.notes]
    .sort((a, b) => a.start - b.start)
    .map((note) => {
      const pitch = normalizeGeneratedPitch(
        note.octave,
        note.scaleDegree + payload.transposition,
        numScaleDegrees,
      );
      const freq = getGeneratedPitchValue(payload, pitch.octave, pitch.scaleDegree);
      let template = (note.noteTemplate ?? payload.noteTemplate).trim();

      template = replaceAllText(template, '<INSTR_ID>', instrReplacement);
      template = replaceAllText(template, '<INSTR_NAME>', instrumentId);
      template = replaceAllText(template, '<START>', String(note.start));
      template = replaceAllText(template, '<DUR>', String(note.duration));
      template = replaceAllText(template, '<FREQ>', freq);

      for (let i = 0; i < payload.fieldDefinitions.length; i += 1) {
        const field = payload.fieldDefinitions[i]!;
        const value = note.fieldValues[i] ?? field.defaultValue;
        const replacement = field.fieldType === 'DISCRETE' ? String(Math.round(value)) : String(value);
        template = replaceAllText(template, `<${field.fieldName}>`, replacement);
      }

      return template;
    })
    .join('\n');
}

function normalizeGeneratedPitch(octave: number, scaleDegree: number, numScaleDegrees: number): { octave: number; scaleDegree: number } {
  let nextOctave = octave;
  let nextScaleDegree = scaleDegree;

  if (nextScaleDegree >= numScaleDegrees) {
    nextOctave += Math.floor(nextScaleDegree / numScaleDegrees);
    nextScaleDegree %= numScaleDegrees;
  }

  if (nextScaleDegree < 0) {
    const octaveDiff = Math.floor((nextScaleDegree * -1) / numScaleDegrees) + 1;
    nextScaleDegree %= numScaleDegrees;
    nextOctave -= octaveDiff;
    nextScaleDegree = numScaleDegrees + nextScaleDegree;
  }

  return { octave: nextOctave, scaleDegree: nextScaleDegree };
}

function getGeneratedPitchValue(payload: PianoRollPayload, octave: number, scaleDegree: number): string {
  switch (payload.pchGenerationMethod) {
    case GENERATE_FREQUENCY:
      return String(getScaleFrequency(payload, octave, scaleDegree));
    case GENERATE_PCH:
      return `${octave}.${scaleDegree}`;
    case GENERATE_MIDI:
      return String((octave * 12) + scaleDegree);
    default:
      return '';
  }
}

function getScaleFrequency(payload: PianoRollPayload, octave: number, scaleDegree: number): number {
  let oct = octave;
  let pitchIndex = scaleDegree;
  const ratios = payload.scale.ratios.length > 0 ? payload.scale.ratios : [1];

  if (pitchIndex >= ratios.length) {
    oct += Math.floor(pitchIndex / ratios.length);
    pitchIndex %= ratios.length;
  }

  if (pitchIndex < 0) {
    const octaveDiff = Math.floor((pitchIndex * -1) / ratios.length) + 1;
    pitchIndex %= ratios.length;
    oct -= octaveDiff;
    pitchIndex = ratios.length + pitchIndex;
  }

  if (pitchIndex >= ratios.length) {
    oct += Math.floor(pitchIndex / ratios.length);
    pitchIndex %= ratios.length;
  }

  const multiplier = Math.pow(payload.scale.octave, oct - 8);
  return multiplier * payload.scale.baseFrequency * ratios[pitchIndex]!;
}

function replaceAllText(text: string, search: string, replacement: string): string {
  return text.split(search).join(replacement);
}

function isIntegerText(text: string): boolean {
  return /^[-+]?\d+$/.test(text);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable
    || target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement;
}
