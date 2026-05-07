import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

function FieldRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <label className="w-28 shrink-0 text-xs text-blue-muted text-right">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function TrackerObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'TrackerObject') return <></>;

  const { stepsPerBeat, trackData } = editor.payload as {
    stepsPerBeat: number;
    trackData: string[][];
  };

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  const handleCellChange = useCallback((trackIndex: number, stepIndex: number, value: string) => {
    patch({ updateTrackCell: { trackIndex, stepIndex, value } });
  }, [patch]);

  const handleAddTrack = useCallback(() => {
    patch({ addTrack: true });
  }, [patch]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-3 px-3 py-2 border-b border-blue-border shrink-0">
        <FieldRow label="Steps/Beat">
          <input
            type="number"
            min={1}
            max={64}
            className="w-16 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
            value={stepsPerBeat}
            onChange={(e) => patch({ stepsPerBeat: parseInt(e.target.value, 10) || 1 })}
          />
        </FieldRow>
        <FieldRow label="Tracks">
          <span className="text-xs text-gray-300 py-1">{trackData.length}</span>
        </FieldRow>
      </div>

      <div className="flex-1 overflow-auto">
        {trackData.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-blue-muted">
            No tracks
          </div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-border">
                <th className="px-2 py-1 text-left text-blue-muted font-normal w-16">Track</th>
                {trackData[0]?.map((_, si) => (
                  <th key={si} className="px-1 py-1 text-center text-blue-muted font-normal">{si}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trackData.map((track, ti) => (
                <tr key={ti} className="border-b border-blue-border/50">
                  <td className="px-2 py-0.5 text-gray-400">{ti}</td>
                  {track.map((cell, si) => (
                    <td key={si} className="px-0.5 py-0.5">
                      <input
                        type="text"
                        className="w-full min-w-[3rem] rounded border border-blue-border bg-blue-bg px-1 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none text-center"
                        value={cell}
                        onChange={(e) => handleCellChange(ti, si, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-3 py-2">
          <button
            className="px-2 py-1 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30"
            onClick={handleAddTrack}
          >+ Add Track</button>
        </div>
      </div>
    </div>
  );
}
