import React, { useCallback, useRef, useState } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import type { LinePoint, LineData } from '@blue/data/sound-objects/line-object';

const CANVAS_H = 260;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 12;
const PAD_B = 24;

function colorForLine(color: number): string {
  return `#${(color >>> 0).toString(16).padStart(6, '0').slice(-6)}`;
}

function toCanvas(p: LinePoint, w: number): { cx: number; cy: number } {
  const plotW = w - PAD_L - PAD_R;
  const plotH = CANVAS_H - PAD_T - PAD_B;
  return {
    cx: PAD_L + p.x * plotW,
    cy: CANVAS_H - PAD_B - p.y * plotH,
  };
}

function fromCanvas(cx: number, cy: number, w: number): LinePoint {
  const plotW = w - PAD_L - PAD_R;
  const plotH = CANVAS_H - PAD_T - PAD_B;
  return {
    x: Math.max(0, Math.min(1, (cx - PAD_L) / plotW)),
    y: Math.max(0, Math.min(1, (CANVAS_H - PAD_B - cy) / plotH)),
  };
}

interface LineCanvasProps {
  line: LineData;
  width: number;
  onChange: (points: LinePoint[]) => void;
}

function LineCanvas({ line, width, onChange }: LineCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const drawW = Math.max(width, 200);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    const w = drawW;
    const h = CANVAS_H;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const plotW = w - PAD_L - PAD_R;
    const plotH = h - PAD_T - PAD_B;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD_L, PAD_T, plotW, plotH);

    ctx.fillStyle = '#555';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = PAD_T + i * plotH / 4;
      ctx.strokeStyle = '#2a2a3e';
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(w - PAD_R, y);
      ctx.stroke();
      ctx.fillText(((4 - i) / 4).toFixed(2), PAD_L - 4, y);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
      const x = PAD_L + i * plotW / 4;
      ctx.strokeStyle = '#2a2a3e';
      ctx.beginPath();
      ctx.moveTo(x, PAD_T);
      ctx.lineTo(x, h - PAD_B);
      ctx.stroke();
      ctx.fillText((i / 4).toFixed(2), x, h - PAD_B + 4);
    }

    const pts = line.points;
    if (pts.length === 0) {
      ctx.restore();
      return;
    }
    const sorted = [...pts].sort((a, b) => a.x - b.x);
    const lineColor = colorForLine(line.color);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < sorted.length; i++) {
      const { cx, cy } = toCanvas(sorted[i], w);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    for (const pt of sorted) {
      const { cx, cy } = toCanvas(pt, w);
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();
  }, [line, drawW, dpr]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (drawW / rect.width);
      const my = (e.clientY - rect.top) * (CANVAS_H / rect.height);

      let closest = -1;
      let closestDist = 14;
      for (let i = 0; i < line.points.length; i++) {
        const { cx, cy } = toCanvas(line.points[i], drawW);
        const d = Math.hypot(cx - mx, cy - my);
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }
      if (closest >= 0) {
        setDragIdx(closest);
      } else if (
        mx >= PAD_L &&
        mx <= drawW - PAD_R &&
        my >= PAD_T &&
        my <= CANVAS_H - PAD_B
      ) {
        const pt = fromCanvas(mx, my, drawW);
        const newPoints = [...line.points, pt].sort((a, b) => a.x - b.x);
        onChange(newPoints);
      }
    },
    [line.points, onChange, drawW],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragIdx === null) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (drawW / rect.width);
      const my = (e.clientY - rect.top) * (CANVAS_H / rect.height);
      const pts = [...line.points];
      const newPt = fromCanvas(mx, my, drawW);

      const sorted = pts.map((p, i) => ({ p, i })).sort((a, b) => a.p.x - b.p.x);
      const sortedPos = sorted.findIndex((s) => s.i === dragIdx);

      if (sortedPos > 0) {
        newPt.x = Math.max(newPt.x, sorted[sortedPos - 1].p.x + 0.001);
      }
      if (sortedPos < sorted.length - 1) {
        newPt.x = Math.min(newPt.x, sorted[sortedPos + 1].p.x - 0.001);
      }
      newPt.x = Math.max(0, Math.min(1, newPt.x));
      newPt.y = Math.max(0, Math.min(1, newPt.y));

      pts[dragIdx] = newPt;
      onChange(pts);
    },
    [dragIdx, line.points, onChange, drawW],
  );

  const handleMouseUp = useCallback(() => {
    setDragIdx(null);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (drawW / rect.width);
      const my = (e.clientY - rect.top) * (CANVAS_H / rect.height);

      let closest = -1;
      let closestDist = 14;
      for (let i = 0; i < line.points.length; i++) {
        const { cx, cy } = toCanvas(line.points[i], drawW);
        const d = Math.hypot(cx - mx, cy - my);
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }
      if (closest >= 0 && line.points.length > 2) {
        const pts = [...line.points];
        pts.splice(closest, 1);
        onChange(pts);
      }
    },
    [line.points, onChange, drawW],
  );

  React.useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={drawW * dpr}
      height={CANVAS_H * dpr}
      style={{ width: drawW, height: CANVAS_H }}
      className="rounded cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    />
  );
}

export default function LineObjectEditor({
  document,
  onPatch,
}: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'LineObject')
    return <></>;

  const { lines } = editor.payload as { lines: LineData[] };
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [splitX, setSplitX] = useState(200);
  const draggingSplit = useRef(false);

  const patchLines = useCallback(
    (newLines: LineData[]) => {
      onPatch({
        type: 'updateTypeSpecificEditor',
        target: document.target,
        patch: { lines: newLines },
      });
    },
    [document.target, onPatch],
  );

  const handlePointsChange = useCallback(
    (points: LinePoint[]) => {
      const updated = lines.map((l, i) =>
        i === selectedIdx ? { ...l, points } : l,
      );
      patchLines(updated);
    },
    [lines, selectedIdx, patchLines],
  );

  const handleAddLine = useCallback(() => {
    const idx = lines.length;
    const defaultColors = [
      0x6699cc, 0xcc6699, 0x66cc99, 0xcc9966, 0x9966cc, 0x99cc66, 0x6699cc,
      0xcc6666,
    ];
    const newLine: LineData = {
      varName: `line${idx}`,
      color: defaultColors[idx % defaultColors.length],
      points: [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ],
    };
    patchLines([...lines, newLine]);
    setSelectedIdx(lines.length);
  }, [lines, patchLines]);

  const handleRemoveLine = useCallback(() => {
    if (lines.length === 0 || selectedIdx < 0 || selectedIdx >= lines.length)
      return;
    const updated = [...lines];
    updated.splice(selectedIdx, 1);
    patchLines(updated);
    setSelectedIdx(Math.max(0, Math.min(selectedIdx, updated.length - 1)));
  }, [lines, selectedIdx, patchLines]);

  const handleVarNameChange = useCallback(
    (varName: string) => {
      const updated = lines.map((l, i) =>
        i === selectedIdx ? { ...l, varName } : l,
      );
      patchLines(updated);
    },
    [lines, selectedIdx, patchLines],
  );

  const handleSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingSplit.current = true;
    const onMove = (ev: MouseEvent) => {
      if (!draggingSplit.current) return;
      const parent = (e.target as HTMLElement).parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        setSplitX(Math.max(120, Math.min(400, ev.clientX - rect.left)));
      }
    };
    const onUp = () => {
      draggingSplit.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const selectedLine = lines[selectedIdx] ?? null;

  return (
    <div className="flex h-full select-none">
      <div
        className="flex flex-col shrink-0 border-r border-blue-border overflow-hidden"
        style={{ width: splitX }}
      >
        <div className="flex items-center gap-1 px-2 py-1 border-b border-blue-border bg-blue-bg/50">
          <span className="text-[10px] text-blue-muted uppercase tracking-wider flex-1">
            Lines
          </span>
          <button
            className="px-1.5 py-0.5 text-[10px] rounded border border-blue-border text-blue-muted hover:bg-blue-border/30"
            onClick={handleAddLine}
            title="Add line"
          >
            +
          </button>
          <button
            className="px-1.5 py-0.5 text-[10px] rounded border border-blue-border text-blue-muted hover:bg-blue-border/30"
            onClick={handleRemoveLine}
            title="Remove selected line"
          >
            -
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-border">
                <th className="w-8 px-1 py-1 text-left text-[9px] text-blue-muted font-normal">
                  []
                </th>
                <th className="px-1 py-1 text-left text-[9px] text-blue-muted font-normal">
                  Name
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr
                  key={i}
                  className={`border-b border-blue-border/30 cursor-pointer ${
                    i === selectedIdx
                      ? 'bg-blue-accent/20'
                      : 'hover:bg-blue-bg/50'
                  }`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <td className="px-1 py-1">
                    <span
                      className="block w-4 h-3 rounded-sm"
                      style={{ backgroundColor: colorForLine(line.color) }}
                    />
                  </td>
                  <td className="px-1 py-1 text-gray-300 font-mono">
                    {line.varName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedLine && (
          <div className="border-t border-blue-border px-2 py-1.5">
            <label className="text-[9px] text-blue-muted uppercase tracking-wider block mb-0.5">
              Var Name
            </label>
            <input
              type="text"
              className="w-full rounded border border-blue-border bg-blue-bg px-1.5 py-0.5 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
              value={selectedLine.varName}
              onChange={(e) => handleVarNameChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div
        className="w-1.5 cursor-col-resize bg-blue-border/50 hover:bg-blue-accent/50 shrink-0"
        onMouseDown={handleSplitMouseDown}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedLine ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1 border-b border-blue-border bg-blue-bg/30">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: colorForLine(selectedLine.color) }}
              />
              <span className="text-xs text-gray-300 font-mono">
                {selectedLine.varName}
              </span>
              <span className="text-[10px] text-blue-muted">
                {selectedLine.points.length} points
              </span>
              <span className="text-[10px] text-blue-muted ml-auto">
                Click to add point, drag to move, right-click to remove
              </span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <LineCanvas
                line={selectedLine}
                width={600}
                onChange={handlePointsChange}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-blue-muted">
            {lines.length === 0
              ? 'No lines defined — click + to add one'
              : 'Select a line to edit'}
          </div>
        )}
      </div>
    </div>
  );
}
