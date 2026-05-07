import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useScoreSelectionStore } from '../../../stores/score-selection-store';
import { useProjectStore } from '../../../stores/project-store';
import type {
  ScoreObjectEditorDocumentSnapshot,
  ScorePatch,
  TypeSpecificScoreObjectEditorSnapshot,
} from '../../../../shared/project-editor';
import { resolveEditorComponent } from './score-object/editor-registry';

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center bg-blue-bg px-4 text-center text-blue-muted">
      <div className="text-sm">{message}</div>
    </div>
  );
}

function applyPatchToDocument(
  doc: ScoreObjectEditorDocumentSnapshot,
  patch: ScorePatch,
): ScoreObjectEditorDocumentSnapshot {
  if (patch.type === 'updateTypeSpecificEditor' && doc.editor.kind === 'code') {
    const editor: TypeSpecificScoreObjectEditorSnapshot = {
      ...doc.editor,
      text: patch.patch.text as string,
    };
    return { ...doc, editor };
  }
  if (patch.type === 'updateTypeSpecificEditor' && doc.editor.kind === 'audioClip') {
    const editor: TypeSpecificScoreObjectEditorSnapshot = {
      ...doc.editor,
      ...(patch.patch.audioFile !== undefined && { audioFile: patch.patch.audioFile as string }),
      ...(patch.patch.fileStartTime !== undefined && { fileStartTime: patch.patch.fileStartTime as number }),
      ...(patch.patch.fadeIn !== undefined && { fadeIn: patch.patch.fadeIn as number }),
      ...(patch.patch.fadeOut !== undefined && { fadeOut: patch.patch.fadeOut as number }),
      ...(patch.patch.fadeInType !== undefined && { fadeInType: patch.patch.fadeInType as string }),
      ...(patch.patch.fadeOutType !== undefined && { fadeOutType: patch.patch.fadeOutType as string }),
      ...(patch.patch.looping !== undefined && { looping: patch.patch.looping as boolean }),
    };
    return { ...doc, editor };
  }
  if (patch.type === 'updateTypeSpecificEditor' && doc.editor.kind === 'structured') {
    const payload = { ...(doc.editor.payload as Record<string, unknown>) };
    const p = patch.patch;
    if (p.beats !== undefined) payload.beats = p.beats;
    if (p.subDivisions !== undefined) payload.subDivisions = p.subDivisions;
    if (p.instrumentId !== undefined) payload.instrumentId = p.instrumentId;
    if (p.noteTemplate !== undefined) payload.noteTemplate = p.noteTemplate;
    if (p.pchGenerationMethod !== undefined) payload.pchGenerationMethod = p.pchGenerationMethod;
    if (p.transposition !== undefined) payload.transposition = p.transposition;
    if (p.stepsPerBeat !== undefined) payload.stepsPerBeat = p.stepsPerBeat;
    if (p.zakSpace !== undefined) payload.zakSpace = p.zakSpace;
    if (p.seedUsed !== undefined) payload.seedUsed = p.seedUsed;
    if (p.seed !== undefined) payload.seed = p.seed;
    if (p.comment !== undefined) payload.comment = p.comment;
    if (p.staffData !== undefined) payload.staffData = p.staffData;
    if (Array.isArray(p.patterns)) payload.patterns = p.patterns;
    if (Array.isArray(p.lines)) payload.lines = p.lines;
    if (Array.isArray(p.trackData)) payload.trackData = p.trackData;
    if (p.filePath !== undefined) payload.filePath = p.filePath;
    if (p.csoundPostCode !== undefined) payload.csoundPostCode = p.csoundPostCode;

    if (p.toggleStep !== undefined && Array.isArray(payload.patterns)) {
      const { patternIndex, stepIndex } = p.toggleStep as { patternIndex: number; stepIndex: number };
      const patterns = (payload.patterns as Array<Record<string, unknown>>).map((pat, pi) => {
        if (pi !== patternIndex) return pat;
        const values = [...(pat.values as boolean[])];
        values[stepIndex] = !values[stepIndex];
        return { ...pat, values };
      });
      payload.patterns = patterns;
    }
    if (p.toggleMute !== undefined && Array.isArray(payload.patterns)) {
      const idx = p.toggleMute as number;
      const patterns = (payload.patterns as Array<Record<string, unknown>>).map((pat, pi) => {
        if (pi !== idx) return pat;
        return { ...pat, muted: !pat.muted };
      });
      payload.patterns = patterns;
    }
    if (p.toggleSolo !== undefined && Array.isArray(payload.patterns)) {
      const idx = p.toggleSolo as number;
      const patterns = (payload.patterns as Array<Record<string, unknown>>).map((pat, pi) => {
        if (pi !== idx) return pat;
        return { ...pat, solo: !pat.solo };
      });
      payload.patterns = patterns;
    }
    if (p.updatePatternScore !== undefined && Array.isArray(payload.patterns)) {
      const { patternIndex, patternScore } = p.updatePatternScore as { patternIndex: number; patternScore: string };
      const patterns = (payload.patterns as Array<Record<string, unknown>>).map((pat, pi) => {
        if (pi !== patternIndex) return pat;
        return { ...pat, patternScore };
      });
      payload.patterns = patterns;
    }
    if (p.updatePatternName !== undefined && Array.isArray(payload.patterns)) {
      const { patternIndex, patternName } = p.updatePatternName as { patternIndex: number; patternName: string };
      const patterns = (payload.patterns as Array<Record<string, unknown>>).map((pat, pi) => {
        if (pi !== patternIndex) return pat;
        return { ...pat, patternName };
      });
      payload.patterns = patterns;
    }
    if (p.addPattern !== undefined && Array.isArray(payload.patterns)) {
      const beats = (payload.beats as number) ?? 4;
      const subDivisions = (payload.subDivisions as number) ?? 4;
      const numSteps = beats * subDivisions;
      const newPattern = {
        patternName: `pattern`,
        patternScore: '',
        muted: false,
        solo: false,
        values: new Array(numSteps).fill(false),
      };
      payload.patterns = [...(payload.patterns as Array<Record<string, unknown>>), newPattern];
      payload.numSteps = numSteps;
    }
    if (p.updateTrackCell !== undefined && Array.isArray(payload.trackData)) {
      const { trackIndex, stepIndex, value } = p.updateTrackCell as { trackIndex: number; stepIndex: number; value: string };
      const trackData = (payload.trackData as string[][]).map((track, ti) => {
        if (ti !== trackIndex) return track;
        const updated = [...track];
        updated[stepIndex] = value;
        return updated;
      });
      payload.trackData = trackData;
    }
    if (p.addTrack !== undefined && Array.isArray(payload.trackData)) {
      const trackData = payload.trackData as string[][];
      const numCols = trackData[0]?.length ?? 16;
      payload.trackData = [...trackData, new Array(numCols).fill('')];
    }

    const editor: TypeSpecificScoreObjectEditorSnapshot = {
      ...doc.editor,
      payload,
    };
    return { ...doc, editor };
  }
  if (patch.type === 'updateSharedProperties') {
    const shared = { ...doc.shared };
    if (patch.patch.name !== undefined) shared.name = patch.patch.name;
    if (patch.patch.backgroundColor !== undefined) shared.backgroundColor = patch.patch.backgroundColor;
    if (patch.patch.startTime !== undefined) {
      shared.startTime = { ...shared.startTime, value: patch.patch.startTime.value, timeBase: patch.patch.startTime.timeBase };
    }
    if (patch.patch.subjectiveDuration !== undefined) {
      shared.subjectiveDuration = { ...shared.subjectiveDuration, value: patch.patch.subjectiveDuration.value, timeBase: patch.patch.subjectiveDuration.timeBase };
    }
    return { ...doc, shared };
  }
  return doc;
}

export default function ScoreObjectEditorPanel(): React.ReactElement {
  const loaded = useProjectStore((s) => s.loaded);
  const score = useProjectStore((s) => s.score);
  const applyProjectDocumentPatch = useProjectStore((s) => s.applyProjectDocumentPatch);
  const selectedObjectIds = useScoreSelectionStore((s) => s.selectedObjectIds);
  const [document, setDocument] = useState<ScoreObjectEditorDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedObjectId = useMemo(() => {
    if (selectedObjectIds.size !== 1) return null;
    return [...selectedObjectIds][0];
  }, [selectedObjectIds]);

  const selectedRow = useMemo(() => {
    if (!selectedObjectId) return null;
    for (const lg of score.layerGroups) {
      for (const layer of lg.layers) {
        const found = layer.items.find((item) => item.objectId === selectedObjectId);
        if (found) return found;
      }
    }
    return null;
  }, [selectedObjectId, score]);

  useEffect(() => {
    if (!loaded || !selectedObjectId) {
      setDocument(null);
      return;
    }
    const row = (() => {
      for (const lg of score.layerGroups) {
        for (const layer of lg.layers) {
          const found = layer.items.find((item) => item.objectId === selectedObjectId);
          if (found) return found;
        }
      }
      return null;
    })();
    if (!row?.editorTarget) {
      setDocument(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    window.blueAPI.getScoreObjectEditorDocument({ target: row.editorTarget }).then((doc) => {
      if (!cancelled) {
        setDocument(doc);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setDocument(null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [loaded, selectedObjectId]);

  const handlePatch = useCallback((patch: ScorePatch): void => {
    applyProjectDocumentPatch({ score: patch });
    if (document) {
      setDocument(applyPatchToDocument(document, patch));
    }
  }, [applyProjectDocumentPatch, document]);

  if (!loaded) {
    return <EmptyState message="No project loaded" />;
  }

  if (selectedObjectIds.size === 0) {
    return <EmptyState message="No score object selected" />;
  }

  if (selectedObjectIds.size > 1) {
    return <EmptyState message="Multiple objects selected" />;
  }

  if (loading) {
    return <EmptyState message="Loading..." />;
  }

  if (!document) {
    return <EmptyState message="No editor available" />;
  }

  const EditorComponent = resolveEditorComponent(document.editor);

  return (
    <div className="flex flex-col h-full bg-blue-bg">
      <div className="flex-1 overflow-hidden">
        <EditorComponent document={document} onPatch={handlePatch} />
      </div>
    </div>
  );
}
