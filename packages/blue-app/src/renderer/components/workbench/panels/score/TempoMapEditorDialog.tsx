import { useState, useCallback, useEffect } from 'react';
import type { TempoMapSnapshot, TempoPointSnapshot, TempoMapPatch } from '../../../../../shared/project-editor';

interface TempoMapEditorDialogProps {
  tempoMap: TempoMapSnapshot;
  onCommit: (patch: TempoMapPatch) => void;
  onClose: () => void;
}

export default function TempoMapEditorDialog({
  tempoMap,
  onCommit,
  onClose,
}: TempoMapEditorDialogProps) {
  const [rows, setRows] = useState<TempoPointSnapshot[]>(() =>
    tempoMap.points.map((p) => ({ ...p }))
  );

  const handleAdd = useCallback(() => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          beat: last ? last.beat + 4.0 : 0,
          tempo: last ? last.tempo : 60,
          curveType: 'constant' as const,
        },
      ];
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleBeatChange = useCallback((index: number, value: string) => {
    const beat = Math.max(0, parseFloat(value) || 0);
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], beat };
      return next;
    });
  }, []);

  const handleTempoChange = useCallback((index: number, value: string) => {
    const tempo = Math.max(1, parseFloat(value) || 60);
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], tempo };
      return next;
    });
  }, []);

  const handleOk = useCallback(() => {
    const sortedRows = [...rows].sort((a, b) => a.beat - b.beat);
    if (sortedRows.length === 0 || sortedRows[0].beat !== 0) return;
    onCommit({
      type: 'replaceTempoMap',
      map: {
        enabled: tempoMap.enabled,
        visible: tempoMap.visible,
        points: sortedRows,
      },
    });
    onClose();
  }, [rows, tempoMap.enabled, tempoMap.visible, onCommit, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  const canDelete = rows.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e3a] border border-blue-border/40 rounded-lg shadow-xl"
        style={{ minWidth: 320 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 className="text-blue-text text-sm font-medium px-4 pt-3 pb-2">Edit Tempo Map</h3>

        <div className="px-4 pb-2 max-h-[200px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-blue-muted">
                <th className="text-left py-1 pr-2 font-normal">Beat</th>
                <th className="text-left py-1 pr-2 font-normal">Tempo (BPM)</th>
                <th className="text-center py-1 font-normal w-14"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-blue-border/10">
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="w-full bg-[#12122a] border border-blue-border/30 rounded px-1.5 py-0.5 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
                      value={row.beat}
                      onChange={(e) => handleBeatChange(i, e.target.value)}
                      disabled={i === 0}
                      min={0}
                      step={0.001}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="w-full bg-[#12122a] border border-blue-border/30 rounded px-1.5 py-0.5 text-[11px] text-blue-text outline-none focus:border-blue-border/60"
                      value={Math.round(row.tempo)}
                      onChange={(e) => handleTempoChange(i, e.target.value)}
                      min={1}
                      max={999}
                      step={1}
                    />
                  </td>
                  <td className="py-1 text-center">
                    <button
                      className={`text-[10px] px-1.5 py-0.5 rounded ${canDelete ? 'text-red-400 hover:bg-white/10' : 'text-blue-muted cursor-not-allowed'}`}
                      disabled={!canDelete}
                      onClick={() => handleRemove(i)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-blue-border/20">
          <button
            className="text-[11px] text-blue-text bg-blue-surface/80 hover:bg-blue-surface px-3 py-1 rounded border border-blue-border/30"
            onClick={handleAdd}
          >
            Add
          </button>
          <div className="flex gap-2">
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
    </div>
  );
}
