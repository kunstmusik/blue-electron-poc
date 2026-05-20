import { useState, useEffect, useCallback } from 'react';
import type { TempoMapSnapshot, TempoMapPatch } from '../../../../../shared/project-editor';

interface TempoPointDialogProps {
  pointIndex: number;
  tempoMap: TempoMapSnapshot;
  onTempoPatch: (patch: TempoMapPatch) => void;
  onClose: () => void;
}

export default function TempoPointDialog({
  pointIndex,
  tempoMap,
  onTempoPatch,
  onClose,
}: TempoPointDialogProps) {
  const points = tempoMap.points;
  const point = points[pointIndex];
  const isFirst = pointIndex === 0;

  const prevBeat = isFirst ? 0 : points[pointIndex - 1].beat + 0.001;
  const nextBeat = pointIndex < points.length - 1 ? points[pointIndex + 1].beat - 0.001 : Infinity;

  const [beat, setBeat] = useState(point.beat.toString());
  const [tempo, setTempo] = useState(Math.round(point.tempo).toString());

  useEffect(() => {
    setBeat(point.beat.toString());
    setTempo(Math.round(point.tempo).toString());
  }, [point.beat, point.tempo]);

  const handleOk = useCallback(() => {
    const newBeat = isFirst ? 0 : Math.max(prevBeat, Math.min(nextBeat, parseFloat(beat) || 0));
    const newTempo = Math.max(1, Math.min(999, parseFloat(tempo) || 60));

    onTempoPatch({
      type: 'updateTempoPoint',
      index: pointIndex,
      patch: {
        beat: newBeat,
        tempo: newTempo,
      },
    });
    onClose();
  }, [pointIndex, isFirst, prevBeat, nextBeat, beat, tempo, onTempoPatch, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleOk();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [handleOk, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e3a] border border-blue-border/40 rounded-lg p-4 min-w-[240px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 className="text-blue-text text-sm font-medium mb-3">
          {isFirst ? 'Edit Initial Tempo' : `Edit Tempo Point ${pointIndex + 1}`}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-blue-muted w-14">Beat</label>
            <input
              type="number"
              className="flex-1 bg-[#12122a] border border-blue-border/30 rounded px-2 py-1 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
              value={beat}
              onChange={(e) => setBeat(e.target.value)}
              disabled={isFirst}
              min={prevBeat}
              max={isFirst ? 0 : (nextBeat === Infinity ? undefined : nextBeat)}
              step={0.001}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-blue-muted w-14">Tempo</label>
            <input
              type="number"
              className="flex-1 bg-[#12122a] border border-blue-border/30 rounded px-2 py-1 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              min={1}
              max={999}
              step={1}
            />
            <span className="text-[10px] text-blue-muted">BPM</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="text-[11px] text-blue-muted hover:text-blue-text px-3 py-1 rounded border border-blue-border/30"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-[11px] text-blue-text bg-blue-surface/80 hover:bg-blue-surface px-3 py-1 rounded border border-blue-border/30"
            onClick={handleOk}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
