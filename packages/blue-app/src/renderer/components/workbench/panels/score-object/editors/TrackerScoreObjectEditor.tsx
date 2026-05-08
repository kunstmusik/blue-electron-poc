import React, { useCallback, useRef, useState } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

export default function TrackerScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'tracker') return <></>;

  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const gridRef = useRef<HTMLTableElement>(null);

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

  const handleRemoveTrack = useCallback(() => {
    if (editor.tracks.length === 0) return;
    const idx = Math.min(selectedTrack, editor.tracks.length - 1);
    patch({ removeTrack: idx });
  }, [editor.tracks.length, selectedTrack, patch]);

  const handleStepsPerBeatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (v >= 1 && v <= 64) patch({ stepsPerBeat: v });
  }, [patch]);

  const handleOctaveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (v >= 0 && v <= 10) patch({ octave: v });
  }, [patch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, trackIndex: number, stepIndex: number) => {
    const totalSteps = editor.rows.length;
    const totalTracks = editor.tracks.length;
    let nextStep = stepIndex;
    let nextTrack = trackIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextStep = Math.max(0, stepIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextStep = Math.min(totalSteps - 1, stepIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextTrack = Math.max(0, trackIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextTrack = Math.min(totalTracks - 1, trackIndex + 1);
        break;
      case 'Tab':
        return;
      default:
        return;
    }

    const cell = gridRef.current?.querySelector<HTMLInputElement>(
      `[data-track="${nextTrack}"][data-step="${nextStep}"]`,
    );
    cell?.focus();
    cell?.select();
  }, [editor.rows.length, editor.tracks.length]);

  const handleSelectTrack = useCallback((index: number) => {
    setSelectedTrack(index);
  }, []);

  const spb = editor.stepsPerBeat;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-blue-border shrink-0 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-blue-muted">
          <span>Steps/Beat</span>
          <input
            type="number"
            min={1}
            max={64}
            className="w-12 rounded border border-blue-border bg-blue-bg px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
            value={spb}
            onChange={handleStepsPerBeatChange}
          />
        </label>
        <div className="w-px h-4 bg-blue-border" />
        <button
          className="px-2 py-0.5 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30"
          onClick={handleAddTrack}
          title="Add a new track"
        >+ Track</button>
        <button
          className="px-2 py-0.5 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30 disabled:opacity-40"
          onClick={handleRemoveTrack}
          disabled={editor.tracks.length === 0}
          title="Remove selected track"
        >- Track</button>
        <div className="w-px h-4 bg-blue-border" />
        <label className="flex items-center gap-1.5 text-xs text-blue-muted cursor-pointer">
          <input
            type="checkbox"
            checked={editor.showNoteNames}
            onChange={(e) => patch({ showNoteNames: e.target.checked })}
          />
          <span>Note Names</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-blue-muted">
          <span>Octave</span>
          <input
            type="number"
            min={0}
            max={10}
            className="w-12 rounded border border-blue-border bg-blue-bg px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
            value={editor.octave}
            onChange={handleOctaveChange}
          />
        </label>
        <div className="w-px h-4 bg-blue-border" />
        <button
          className="px-2 py-0.5 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30 disabled:opacity-40"
          disabled={!editor.canTest}
          title="Generate score from tracker and show results"
        >Test</button>
        <span className="ml-auto text-xs text-blue-muted">
          {editor.tracks.length} track{editor.tracks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {editor.tracks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-blue-muted">
            No tracks — click "+ Track" to add one
          </div>
        ) : (
          <table ref={gridRef} className="border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 36 }} />
              {editor.tracks.map((track) => (
                <col key={track.trackId} style={{ width: 72 }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-blue-border">
                <th className="px-1 py-1 text-left text-blue-muted font-normal sticky left-0 bg-blue-bg z-10">Step</th>
                {editor.tracks.map((track, ti) => (
                  <th
                    key={track.trackId}
                    className={`px-1 py-1 text-center font-normal cursor-pointer select-none overflow-hidden text-ellipsis whitespace-nowrap ${ti === selectedTrack ? 'text-blue-accent bg-blue-border/20' : 'text-blue-muted'}`}
                    onClick={() => handleSelectTrack(ti)}
                    title={track.trackName}
                  >
                    {track.trackName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editor.rows.map((row, ri) => {
                const isBeatStart = ri % spb === 0;
                return (
                  <tr key={ri} className={`${isBeatStart ? 'border-t border-blue-border/60' : 'border-b border-blue-border/20'}`}>
                    <td className={`px-1 py-0 font-mono text-[10px] sticky left-0 bg-blue-bg z-10 ${isBeatStart ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ri}
                    </td>
                    {editor.tracks.map((_, ti) => {
                      const cellValue = String(row[`track-${ti}`] ?? '');
                      return (
                        <td key={ti} className="px-0 py-0">
                          <input
                            type="text"
                            data-track={ti}
                            data-step={ri}
                            className="w-full bg-transparent px-0 py-0 text-xs text-gray-100 font-mono focus:bg-blue-border/20 focus:outline-none text-center border-0"
                            value={cellValue}
                            onChange={(e) => handleCellChange(ti, ri, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, ti, ri)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
