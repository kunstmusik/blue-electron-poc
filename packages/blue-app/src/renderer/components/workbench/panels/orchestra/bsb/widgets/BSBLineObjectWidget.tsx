import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BSB_LINE_SELECTOR_HEIGHT } from '../../../../../../../shared/bsb-widget-layout';
import WidgetWrapper from './WidgetWrapper';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBLineObjectWidgetProps = BSBWidgetComponentProps;

interface LinePoint {
  x: number;
  y: number;
}

interface LineData {
  varName?: string;
  name?: string;
  min?: number;
  max?: number;
  color?: string | number;
  resolution?: string;
  rightBound?: boolean;
  endPointsLinked?: boolean;
  points: LinePoint[];
}

interface LineHit {
  lineIndex: number;
  pointIndex: number;
}

interface LinePointEntry {
  point: LinePoint;
  index: number;
}

const CANVAS_INSET = 5;

function cloneLines(lines: LineData[]): LineData[] {
  return lines.map((line) => ({
    ...line,
    points: line.points.map((point) => ({ ...point })),
  }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function colorIntToCss(color: number): string {
  const rgb = (color >>> 0) & 0x00ffffff;
  return `#${rgb.toString(16).padStart(6, '0')}`;
}

function normalizeColor(color: string | number | undefined, fallback = '#808080'): string {
  if (typeof color === 'number' && Number.isFinite(color)) {
    return colorIntToCss(color);
  }
  if (typeof color !== 'string') {
    return fallback;
  }
  const trimmed = color.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return colorIntToCss(parseInt(trimmed, 10));
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

function darkenColor(color: string, ratio = 0.7): string {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = Math.floor(parseInt(hex.slice(0, 2), 16) * ratio);
  const g = Math.floor(parseInt(hex.slice(2, 4), 16) * ratio);
  const b = Math.floor(parseInt(hex.slice(4, 6), 16) * ratio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lineMinimum(line: LineData): number {
  return typeof line.min === 'number' ? line.min : 0;
}

function lineMaximum(line: LineData): number {
  return typeof line.max === 'number' ? line.max : 1;
}

function lineRange(line: LineData): number {
  const range = lineMaximum(line) - lineMinimum(line);
  return range === 0 ? 1 : range;
}

function pointValueToCanvasY(line: LineData, y: number, canvasHeight: number): number {
  const normalized = clamp((y - lineMinimum(line)) / lineRange(line), 0, 1);
  return (1 - normalized) * canvasHeight;
}

function canvasYToPointValue(line: LineData, yFromTopNormalized: number): number {
  return lineMinimum(line) + ((1 - yFromTopNormalized) * lineRange(line));
}

function getLinePointY(line: LineData, x: number): number {
  if (line.points.length === 0) {
    const min = lineMinimum(line);
    const max = lineMaximum(line);
    return min + ((max - min) * 0.5);
  }
  if (x <= line.points[0].x) return line.points[0].y;
  const lastPoint = line.points[line.points.length - 1];
  if (x >= lastPoint.x) return lastPoint.y;

  for (let index = 0; index < line.points.length - 1; index++) {
    const currentPoint = line.points[index];
    const nextPoint = line.points[index + 1];
    if (x >= currentPoint.x && x <= nextPoint.x) {
      const span = nextPoint.x - currentPoint.x || 1;
      const ratio = (x - currentPoint.x) / span;
      return currentPoint.y + ratio * (nextPoint.y - currentPoint.y);
    }
  }

  return lastPoint.y;
}

function insertPoint(line: LineData, x: number, y: number): { line: LineData; index: number } {
  const point = { x, y };
  const nextPoints = [...line.points];
  let insertIndex = nextPoints.length;

  for (let index = 0; index < nextPoints.length; index++) {
    if (x <= nextPoints[index].x) {
      insertIndex = index;
      break;
    }
  }

  nextPoints.splice(insertIndex, 0, point);
  return { line: { ...line, points: nextPoints }, index: insertIndex };
}

function movePoint(line: LineData, pointIndex: number, x: number, y: number): LineData {
  const nextLine = cloneLines([line])[0]!;
  const points = nextLine.points;
  const previousPoint = pointIndex > 0 ? points[pointIndex - 1] : undefined;
  const nextPoint = pointIndex < points.length - 1 ? points[pointIndex + 1] : undefined;

  const minX = previousPoint ? previousPoint.x : 0;
  const maxX = nextPoint ? nextPoint.x : 1;
  points[pointIndex] = {
    x: clamp(x, minX, maxX),
    y: clamp(y, lineMinimum(line), lineMaximum(line)),
  };

  return nextLine;
}

function getSortedPointEntries(line: LineData): LinePointEntry[] {
  return line.points
    .map((point, index) => ({ point, index }))
    .sort((left, right) => left.point.x - right.point.x);
}

function BSBLineObjectWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
  selectedWidgetIds,
  getWidgetPosition,
  onWidgetAction,
}: BSBLineObjectWidgetProps): React.ReactElement {
  const linesRaw = node.properties.lines;
  const canUseDom = typeof document !== 'undefined';
  const lines: LineData[] = Array.isArray(linesRaw) ? linesRaw as LineData[] : [];
  const canvasWidth = typeof node.properties.canvasWidth === 'number' ? node.properties.canvasWidth : node.width || 200;
  const canvasHeight = typeof node.properties.canvasHeight === 'number'
    ? node.properties.canvasHeight
    : Math.max(40, (node.height || 100) - BSB_LINE_SELECTOR_HEIGHT);
  const totalHeight = canvasHeight + BSB_LINE_SELECTOR_HEIGHT;
  const selectorLine = lines.length > 0 ? lines[0] : null;
  const lineEditInteractive = !editEnabled;
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [hoverPoint, setHoverPoint] = useState<LineHit | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPointEditor, setShowPointEditor] = useState(false);
  const [pointEditorDraft, setPointEditorDraft] = useState<LinePoint[]>([]);
  const [pointEditorError, setPointEditorError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef(lines);
  const selectedLineIndexRef = useRef(selectedLineIndex);
  const onPatchRef = useRef(onBsbInterfacePatch);
  const dragRef = useRef<LineHit | null>(null);

  linesRef.current = lines;
  selectedLineIndexRef.current = selectedLineIndex;
  onPatchRef.current = onBsbInterfacePatch;

  useEffect(() => {
    if (selectedLineIndex >= lines.length) {
      setSelectedLineIndex(0);
      setSelectedPointIndex(null);
      setHoverPoint(null);
    }
  }, [lines.length, selectedLineIndex]);

  useEffect(() => {
    if (!contextMenuPosition) return undefined;

    const handleMouseDown = (event: MouseEvent) => {
      const menu = contextMenuRef.current;
      if (menu && event.target instanceof Node && menu.contains(event.target)) {
        return;
      }
      setContextMenuPosition(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenuPosition(null);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenuPosition]);

  const currentLine = lines[selectedLineIndex] ?? selectorLine;
  const plotLeft = CANVAS_INSET;
  const plotTop = CANVAS_INSET;
  const plotWidth = Math.max(1, canvasWidth - (CANVAS_INSET * 2));
  const plotHeight = Math.max(1, canvasHeight - (CANVAS_INSET * 2));

  const commitLines = useCallback((nextLines: LineData[]) => {
    onPatchRef.current?.({
      type: 'updateWidgetProperties',
      widgetId: node.id,
      properties: { lines: nextLines },
    });
  }, [node.id]);

  const getPointFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const insetX = (plotLeft / canvasWidth) * rect.width;
    const insetY = (plotTop / canvasHeight) * rect.height;
    const drawableWidth = Math.max(1, rect.width - (insetX * 2));
    const drawableHeight = Math.max(1, rect.height - (insetY * 2));

    const x = clamp((clientX - rect.left - insetX) / drawableWidth, 0, 1);
    const yFromTop = clamp((clientY - rect.top - insetY) / drawableHeight, 0, 1);

    return {
      x,
      yFromTop,
      rect,
      insetX,
      insetY,
      drawableWidth,
      drawableHeight,
    };
  }, [canvasHeight, canvasWidth, plotLeft, plotTop]);

  const findPointHit = useCallback((clientX: number, clientY: number, lineIndex: number): LineHit | null => {
    const line = linesRef.current[lineIndex];
    if (!line) return null;
    const coords = getPointFromEvent(clientX, clientY);
    if (!coords) return null;

    const entries = getSortedPointEntries(line);

    for (const entry of entries) {
      const point = entry.point;
      const px = coords.insetX + (point.x * coords.drawableWidth);
      const py = coords.insetY + pointValueToCanvasY(line, point.y, coords.drawableHeight);
      const dx = px - (coords.insetX + (coords.x * coords.drawableWidth));
      const dy = py - (coords.insetY + (coords.yFromTop * coords.drawableHeight));
      if (Math.hypot(dx, dy) <= 8) {
        return { lineIndex, pointIndex: entry.index };
      }
    }

    return null;
  }, [getPointFromEvent]);

  const updateSelectedLine = useCallback((nextIndex: number) => {
    if (lines.length === 0) return;
    const clampedIndex = ((nextIndex % lines.length) + lines.length) % lines.length;
    setSelectedLineIndex(clampedIndex);
    setSelectedPointIndex(null);
    setHoverPoint(null);
  }, [lines.length]);

  const resetCurrentLine = useCallback(() => {
    const targetLine = linesRef.current[selectedLineIndexRef.current];
    if (!targetLine) return;

    const resetY = clamp(0.5, lineMinimum(targetLine), lineMaximum(targetLine));
    const points: LinePoint[] = [{ x: 0, y: resetY }];
    if (targetLine.rightBound ?? false) {
      points.push({ x: 1, y: resetY });
    }

    const nextLines = cloneLines(linesRef.current);
    nextLines[selectedLineIndexRef.current] = {
      ...nextLines[selectedLineIndexRef.current]!,
      points,
    };

    setSelectedPointIndex(null);
    setHoverPoint(null);
    commitLines(nextLines);
  }, [commitLines]);

  const openPointEditor = useCallback(() => {
    const targetLine = linesRef.current[selectedLineIndexRef.current];
    if (!targetLine) return;
    const sorted = [...targetLine.points].sort((left, right) => left.x - right.x);
    setPointEditorDraft(sorted.map((point) => ({ ...point })));
    setPointEditorError(null);
    setShowPointEditor(true);
  }, []);

  const applyPointEditor = useCallback(() => {
    const targetLine = linesRef.current[selectedLineIndexRef.current];
    if (!targetLine) return;
    if (pointEditorDraft.length === 0) {
      setPointEditorError('At least one point is required.');
      return;
    }

    const normalized = pointEditorDraft.map((point) => ({
      x: clamp(point.x, 0, 1),
      y: clamp(point.y, lineMinimum(targetLine), lineMaximum(targetLine)),
    })).sort((left, right) => left.x - right.x);

    const nextLines = cloneLines(linesRef.current);
    nextLines[selectedLineIndexRef.current] = {
      ...nextLines[selectedLineIndexRef.current]!,
      points: normalized,
    };

    commitLines(nextLines);
    setShowPointEditor(false);
    setPointEditorError(null);
  }, [commitLines, pointEditorDraft]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!lineEditInteractive || !currentLine) {
      return;
    }

    setContextMenuPosition(null);

    const hit = findPointHit(event.clientX, event.clientY, selectedLineIndexRef.current);
    if (hit) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedPointIndex(hit.pointIndex);
      setHoverPoint(hit);
      dragRef.current = hit;
      return;
    }

    if (!node.properties.locked) {
      const point = getPointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      event.preventDefault();
      event.stopPropagation();
      const startY = event.altKey
        ? getLinePointY(currentLine, point.x)
        : canvasYToPointValue(currentLine, point.yFromTop);
      const nextLines = cloneLines(linesRef.current);
      const targetLine = nextLines[selectedLineIndexRef.current];
      if (!targetLine) return;
      const inserted = insertPoint(targetLine, point.x, clamp(startY, lineMinimum(targetLine), lineMaximum(targetLine)));
      nextLines[selectedLineIndexRef.current] = inserted.line;
      setSelectedPointIndex(inserted.index);
      setHoverPoint({ lineIndex: selectedLineIndexRef.current, pointIndex: inserted.index });
      dragRef.current = { lineIndex: selectedLineIndexRef.current, pointIndex: inserted.index };
      commitLines(nextLines);
    }
  }, [commitLines, currentLine, findPointHit, getPointFromEvent, lineEditInteractive, node.properties.locked]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!lineEditInteractive || !currentLine || dragRef.current) return;
    const hit = findPointHit(event.clientX, event.clientY, selectedLineIndexRef.current);
    setHoverPoint(hit);
  }, [currentLine, findPointHit, lineEditInteractive]);

  useEffect(() => {
    if (!lineEditInteractive) {
      dragRef.current = null;
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      event.preventDefault();

      const point = getPointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      const nextLines = cloneLines(linesRef.current);
      const targetLine = nextLines[drag.lineIndex];
      if (!targetLine) return;

      const y = canvasYToPointValue(targetLine, point.yFromTop);
      nextLines[drag.lineIndex] = movePoint(targetLine, drag.pointIndex, point.x, y);
      setSelectedPointIndex(drag.pointIndex);
      setHoverPoint({ lineIndex: drag.lineIndex, pointIndex: drag.pointIndex });
      commitLines(nextLines);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [commitLines, getPointFromEvent, lineEditInteractive]);

  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!lineEditInteractive || !currentLine) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const hit = findPointHit(event.clientX, event.clientY, selectedLineIndexRef.current);
    if (hit && !node.properties.locked) {
      const line = linesRef.current[hit.lineIndex];
      if (line) {
        const minPoints = line.rightBound ? 2 : 1;
        const nextLines = cloneLines(linesRef.current);
        const targetLine = nextLines[hit.lineIndex];
        if (!targetLine) return;
        if (targetLine.points.length > minPoints) {
          targetLine.points.splice(hit.pointIndex, 1);
          nextLines[hit.lineIndex] = targetLine;
          setSelectedPointIndex(null);
          setHoverPoint(null);
          commitLines(nextLines);
        }
      }
      return;
    }

    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [commitLines, currentLine, findPointHit, lineEditInteractive, node.properties.locked]);

  const selectorLabel = useMemo(() => {
    if (lines.length === 0) return 'No lines';
    const line = lines[selectedLineIndex];
    return line?.name || line?.varName || `Line ${selectedLineIndex + 1}`;
  }, [lines, selectedLineIndex]);

  const hoverLine = hoverPoint ? lines[hoverPoint.lineIndex] : null;
  const hoverPointValue = hoverLine && hoverPoint ? hoverLine.points[hoverPoint.pointIndex] : null;
  const hoverTooltip = useMemo(() => {
    if (!hoverPoint || !hoverLine || !hoverPointValue) return null;
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const insetX = (plotLeft / canvasWidth) * rect.width;
    const insetY = (plotTop / canvasHeight) * rect.height;
    const drawableWidth = Math.max(1, rect.width - (insetX * 2));
    const drawableHeight = Math.max(1, rect.height - (insetY * 2));
    const pointX = rect.left + insetX + (hoverPointValue.x * drawableWidth);
    const pointY = rect.top + insetY + pointValueToCanvasY(hoverLine, hoverPointValue.y, drawableHeight);

    return {
      pointX,
      pointY,
      canvasTop: rect.top,
      xText: hoverPointValue.x.toFixed(4),
      yText: hoverPointValue.y.toFixed(4),
    };
  }, [canvasHeight, canvasWidth, hoverLine, hoverPoint, hoverPointValue, plotHeight, plotLeft, plotTop, plotWidth]);

  return (
    <>
      <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} displayHeight={totalHeight} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
        <div className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-[#0a0f1a]">
        <svg
          ref={svgRef}
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="block"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => {
            if (!dragRef.current) {
              setHoverPoint(null);
            }
          }}
          onContextMenu={handleContextMenu}
          style={{ cursor: lineEditInteractive && !node.properties.locked ? 'crosshair' : 'default' }}
        >
          <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#0a0f1a" />
          <rect
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotHeight}
            fill="#000000"
            stroke="#d3d3d3"
            strokeWidth={1}
          />
          {lines.map((line, lineIndex) => {
            const selected = lineIndex === selectedLineIndex;
            if (!line.points || line.points.length === 0) return null;
            const baseColor = normalizeColor(line.color, '#66cc66');
            const strokeColor = selected ? baseColor : darkenColor(baseColor);
            const sortedEntries = getSortedPointEntries(line);
            const renderedPoints = sortedEntries.map((entry) => (
              `${plotLeft + (entry.point.x * plotWidth)},${plotTop + pointValueToCanvasY(line, entry.point.y, plotHeight)}`
            ));
            const sortedPoints = sortedEntries.map((entry) => entry.point);
            return (
              <g key={(line.varName || line.name || String(lineIndex))}>
                {sortedPoints.length >= 2 && (
                  <polyline
                    points={renderedPoints.join(' ')}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={selected ? 2.2 : 1.8}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {selected && sortedEntries.map(({ point, index: pointIndex }) => {
                  const hovered = hoverPoint?.lineIndex === lineIndex && hoverPoint.pointIndex === pointIndex;
                  return (
                    <circle
                      key={`${lineIndex}-${pointIndex}`}
                      cx={plotLeft + (point.x * plotWidth)}
                      cy={plotTop + pointValueToCanvasY(line, point.y, plotHeight)}
                      r={hovered ? 4 : 3.5}
                      fill="#000000"
                      stroke={hovered ? '#ff4d4f' : baseColor}
                      strokeWidth={1.2}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </g>
            );
          })}

        </svg>
        <div
          className="flex items-center gap-1 border-t border-blue-border/40 px-1 text-[10px] text-blue-muted"
          style={{ height: BSB_LINE_SELECTOR_HEIGHT }}
        >
          <button
            type="button"
            className="h-5 w-7 shrink-0 rounded border border-blue-border/40 text-[9px] text-blue-muted hover:text-gray-200"
            onClick={(event) => {
              event.stopPropagation();
              updateSelectedLine(selectedLineIndex - 1);
            }}
            disabled={lines.length === 0}
          >
            ◀
          </button>
          <div className="min-w-0 flex-1 truncate px-1 text-center font-mono text-[10px] text-gray-200" title={selectorLabel}>
            {selectorLabel}
          </div>
          <button
            type="button"
            className="h-5 w-7 shrink-0 rounded border border-blue-border/40 text-[9px] text-blue-muted hover:text-gray-200"
            onClick={(event) => {
              event.stopPropagation();
              updateSelectedLine(selectedLineIndex + 1);
            }}
            disabled={lines.length === 0}
          >
            ▶
          </button>
        </div>
        </div>
      </WidgetWrapper>
      {canUseDom && contextMenuPosition && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] min-w-[150px] rounded border border-blue-border bg-[#1a2941] py-1 text-xs text-gray-100 shadow-xl"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <button
            type="button"
            className="block w-full px-3 py-1 text-left hover:bg-[#2b3f5f]"
            onClick={() => {
              setContextMenuPosition(null);
              openPointEditor();
            }}
          >
            Edit Points
          </button>
          <button
            type="button"
            className="block w-full px-3 py-1 text-left hover:bg-[#2b3f5f]"
            onClick={() => {
              setContextMenuPosition(null);
              resetCurrentLine();
            }}
          >
            Reset Line
          </button>
        </div>,
        document.body,
      )}
      {canUseDom && hoverTooltip && createPortal(
        <div
          className="pointer-events-none fixed z-[9998] min-w-[128px] rounded border border-[#2b3f5f] bg-[#0a0f1a] px-3 py-2 font-mono text-[10px] text-white shadow-lg"
          style={{
            left: Math.max(8, Math.min(hoverTooltip.pointX + 10, window.innerWidth - 170)),
            top: Math.max(8, Math.min(hoverTooltip.canvasTop - 44, window.innerHeight - 44)),
          }}
        >
          <div>x: {hoverTooltip.xText}</div>
          <div>y: {hoverTooltip.yText}</div>
        </div>,
        document.body,
      )}
      {showPointEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPointEditor(false)}>
          <div className="w-[520px] max-h-[70vh] overflow-hidden rounded border border-blue-border bg-[#1d2c45] shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-blue-border px-4 py-2 text-sm font-semibold text-gray-100">
              Line Point Editor
            </div>
            <div className="max-h-[50vh] overflow-auto p-3">
              <table className="w-full border-collapse text-xs text-gray-100">
                <thead>
                  <tr className="border-b border-blue-border bg-[#233550]">
                    <th className="px-2 py-1 text-left font-medium">X</th>
                    <th className="px-2 py-1 text-left font-medium">Y</th>
                    <th className="px-2 py-1 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pointEditorDraft.map((point, index) => (
                    <tr key={index} className="border-b border-blue-border/30">
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          step="0.001"
                          className="w-full rounded border border-blue-border bg-[#101a2b] px-2 py-1 text-xs text-gray-100"
                          value={Number.isFinite(point.x) ? point.x : 0}
                          onChange={(event) => {
                            const value = Number.parseFloat(event.target.value);
                            setPointEditorDraft((current) => current.map((row, rowIndex) => (
                              rowIndex === index ? { ...row, x: Number.isFinite(value) ? value : 0 } : row
                            )));
                          }}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          step="0.001"
                          className="w-full rounded border border-blue-border bg-[#101a2b] px-2 py-1 text-xs text-gray-100"
                          value={Number.isFinite(point.y) ? point.y : 0}
                          onChange={(event) => {
                            const value = Number.parseFloat(event.target.value);
                            setPointEditorDraft((current) => current.map((row, rowIndex) => (
                              rowIndex === index ? { ...row, y: Number.isFinite(value) ? value : 0 } : row
                            )));
                          }}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="rounded border border-blue-border px-2 py-1 text-xs hover:border-blue-accent"
                          onClick={() => {
                            setPointEditorDraft((current) => current.filter((_, rowIndex) => rowIndex !== index));
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded border border-blue-border bg-[#22324d] px-3 py-1 text-xs text-gray-100 hover:border-blue-accent"
                  onClick={() => {
                    const draft = pointEditorDraft.length === 0 ? [{ x: 0, y: 0.5 }] : pointEditorDraft;
                    const last = draft[draft.length - 1] ?? { x: 0, y: 0.5 };
                    setPointEditorDraft([...draft, { x: clamp(last.x + 0.1, 0, 1), y: last.y }]);
                  }}
                >
                  Add Point
                </button>
                {pointEditorError && <span className="text-xs text-red-300">{pointEditorError}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-blue-border px-4 py-3">
              <button
                type="button"
                className="rounded border border-blue-border bg-[#22324d] px-4 py-1.5 text-xs text-gray-200 hover:border-blue-accent"
                onClick={() => setShowPointEditor(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded border border-blue-accent bg-[#3d5f89] px-4 py-1.5 text-xs font-semibold text-gray-100 hover:bg-[#4b73a6]"
                onClick={applyPointEditor}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(BSBLineObjectWidget);
