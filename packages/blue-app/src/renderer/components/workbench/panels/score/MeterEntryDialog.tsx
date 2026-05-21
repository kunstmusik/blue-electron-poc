import { useState, useEffect, useCallback } from 'react';
import type { MeterMapSnapshot, MeterMapPatch } from '../../../../../shared/project-editor';
import { parseMeterSignature, isPowerOfTwo } from './meter-map-utils';

const SECONDARY_BUTTON_CLASS = 'text-[11px] text-blue-text bg-blue-surface/40 hover:bg-blue-surface/70 px-3 py-1 rounded border border-blue-border/40 transition-colors';

interface MeterEntryDialogProps {
  entryIndex: number;
  meterMap: MeterMapSnapshot;
  onMeterPatch: (patch: MeterMapPatch) => void;
  onClose: () => void;
}

export default function MeterEntryDialog({
  entryIndex,
  meterMap,
  onMeterPatch,
  onClose,
}: MeterEntryDialogProps) {
  const entries = meterMap.entries;
  const entry = entries[entryIndex];
  const isFirst = entryIndex === 0;

  const prevMeasure = isFirst ? 1 : entries[entryIndex - 1].measure + 1;
  const nextMeasure = entryIndex < entries.length - 1 ? entries[entryIndex + 1].measure - 1 : 9999;

  const [measure, setMeasure] = useState(entry.measure.toString());
  const [signatureText, setSignatureText] = useState(`${entry.numBeats}/${entry.beatLength}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMeasure(entry.measure.toString());
    setSignatureText(`${entry.numBeats}/${entry.beatLength}`);
  }, [entry.measure, entry.numBeats, entry.beatLength]);

  const handleOk = useCallback(() => {
    const parsed = parseMeterSignature(signatureText);
    if (!parsed) {
      setError('Invalid signature format (use N/D)');
      return;
    }

    const measureNum = parseInt(measure, 10);
    if (!Number.isInteger(measureNum) || measureNum < 1) {
      setError('Measure must be a positive integer');
      return;
    }

    if (!isFirst && measureNum < prevMeasure) {
      setError(`Measure must be >= ${prevMeasure}`);
      return;
    }
    if (measureNum > nextMeasure) {
      setError(`Measure must be <= ${nextMeasure}`);
      return;
    }

    setError(null);
    onMeterPatch({
      type: 'meter-map-update-entry',
      previousMeasure: entry.measure,
      measure: isFirst ? 1 : measureNum,
      numBeats: parsed.numBeats,
      beatLength: parsed.beatLength,
    });
    onClose();
  }, [entry.measure, isFirst, prevMeasure, nextMeasure, measure, signatureText, onMeterPatch, onClose]);

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
          {isFirst ? 'Edit Initial Time Signature' : `Edit Time Signature at Measure ${entry.measure}`}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-blue-muted w-20">Measure</label>
            <input
              type="number"
              className="flex-1 bg-[#12122a] border border-blue-border/30 rounded px-2 py-1 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
              disabled={isFirst}
              min={isFirst ? 1 : prevMeasure}
              max={nextMeasure}
              step={1}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-blue-muted w-20">Time Signature</label>
            <input
              type="text"
              className="flex-1 bg-[#12122a] border border-blue-border/30 rounded px-2 py-1 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="e.g. 4/4 or 7/8"
            />
          </div>
          {error && (
            <p className="text-[10px] text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className={SECONDARY_BUTTON_CLASS}
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
