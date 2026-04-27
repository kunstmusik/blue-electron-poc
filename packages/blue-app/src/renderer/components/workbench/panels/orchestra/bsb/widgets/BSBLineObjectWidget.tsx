import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BSB_LINE_SELECTOR_HEIGHT } from '../../../../../../../shared/bsb-widget-layout';
import WidgetWrapper from './WidgetWrapper';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBLineObjectWidgetProps = BSBWidgetComponentProps;

interface LinePoint {
  x: number;
  y: number;
}

interface LineData {
  varName: string;
  min?: number;
  max?: number;
  color?: string;
  points: LinePoint[];
}

function cloneLines(lines: LineData[]): LineData[] {
  return lines.map((line) => ({
    ...line,
    points: line.points.map((point) => ({ ...point })),
  }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getLinePointY(line: LineData, x: number): number {
  if (line.points.length === 0) return 0.5;
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
    y: clamp(y, 0, 1),
  };

  return nextLine;
}

export default function BSBLineObjectWidget({
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
  const lines: LineData[] = Array.isArray(linesRaw) ? linesRaw as LineData[] : [];
  const canvasWidth = typeof node.properties.canvasWidth === 'number' ? node.properties.canvasWidth : node.width || 200;
  const canvasHeight = typeof node.properties.canvasHeight === 'number'
    ? node.properties.canvasHeight
    : Math.max(40, (node.height || 100) - BSB_LINE_SELECTOR_HEIGHT);
  const totalHeight = canvasHeight + BSB_LINE_SELECTOR_HEIGHT;
  const selectorLine = lines.length > 0 ? lines[0] : null;
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const linesRef = useRef(lines);
  const selectedLineIndexRef = useRef(selectedLineIndex);
  const selectedPointIndexRef = useRef(selectedPointIndex);
  const onPatchRef = useRef(onBsbInterfacePatch);
  const dragRef = useRef<{ lineIndex: number; pointIndex: number } | null>(null);

  linesRef.current = lines;
  selectedLineIndexRef.current = selectedLineIndex;
  selectedPointIndexRef.current = selectedPointIndex;
  onPatchRef.current = onBsbInterfacePatch;

  useEffect(() => {
    if (selectedLineIndex >= lines.length) {
      setSelectedLineIndex(0);
      setSelectedPointIndex(null);
    }
  }, [lines.length, selectedLineIndex]);

  const currentLine = lines[selectedLineIndex] ?? selectorLine;

  const commitLines = useCallback((nextLines: LineData[]) => {
    onPatchRef.current?.({
      type: 'updateWidgetProperties',
      widgetId: node.id,
      properties: { lines: nextLines },
    });
  }, [node.id]);

  const getPointFromEvent = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
    return { x, y, rect };
  }, []);

  const updateSelectedLine = useCallback((nextIndex: number) => {
    if (lines.length === 0) return;
    const clampedIndex = ((nextIndex % lines.length) + lines.length) % lines.length;
    setSelectedLineIndex(clampedIndex);
    setSelectedPointIndex(null);
  }, [lines.length]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!editEnabled || !currentLine) {
      return;
    }

    const point = getPointFromEvent(event);
    if (!point) return;

    const pointRadius = 0.03;
    const hitIndex = currentLine.points.findIndex((candidate) => {
      return Math.abs(candidate.x - point.x) <= pointRadius && Math.abs(candidate.y - point.y) <= pointRadius;
    });

    if (hitIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedPointIndex(hitIndex);
      dragRef.current = { lineIndex: selectedLineIndexRef.current, pointIndex: hitIndex };
      return;
    }

    if (!node.properties.locked) {
      event.preventDefault();
      event.stopPropagation();
      const startY = event.altKey ? getLinePointY(currentLine, point.x) : point.y;
      const nextLines = cloneLines(linesRef.current);
      const targetLine = nextLines[selectedLineIndexRef.current];
      if (!targetLine) return;
      const inserted = insertPoint(targetLine, point.x, startY);
      nextLines[selectedLineIndexRef.current] = inserted.line;
      setSelectedPointIndex(inserted.index);
      dragRef.current = { lineIndex: selectedLineIndexRef.current, pointIndex: inserted.index };
      commitLines(nextLines);
    }
  }, [commitLines, currentLine, editEnabled, getPointFromEvent, node.properties.locked]);

  useEffect(() => {
    if (!editEnabled) {
      dragRef.current = null;
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (!drag || !svg) return;
      event.preventDefault();

      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);

      const nextLines = cloneLines(linesRef.current);
      const targetLine = nextLines[drag.lineIndex];
      if (!targetLine) return;

      nextLines[drag.lineIndex] = movePoint(targetLine, drag.pointIndex, x, y);
      setSelectedPointIndex(drag.pointIndex);
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
  }, [commitLines, editEnabled]);

  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!editEnabled || !currentLine || node.properties.locked) {
      return;
    }

    if (selectedPointIndexRef.current !== null) {
      const index = selectedPointIndexRef.current;
      if (index > 0 && index < currentLine.points.length - 1) {
        event.preventDefault();
        event.stopPropagation();
        const nextLines = cloneLines(linesRef.current);
        const targetLine = nextLines[selectedLineIndexRef.current];
        if (!targetLine) return;
        targetLine.points.splice(index, 1);
        nextLines[selectedLineIndexRef.current] = targetLine;
        setSelectedPointIndex(null);
        commitLines(nextLines);
      }
    }
  }, [commitLines, currentLine, editEnabled, node.properties.locked]);

  const selectorLabel = useMemo(() => {
    if (lines.length === 0) return 'No lines';
    return lines[selectedLineIndex]?.varName || `Line ${selectedLineIndex + 1}`;
  }, [lines, selectedLineIndex]);

  const currentLineColor = currentLine?.color || '#e94560';

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} displayHeight={totalHeight} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-[#0a0f1a]">
        <svg
          ref={svgRef}
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="block"
          onMouseDown={handleCanvasMouseDown}
          onContextMenu={handleContextMenu}
          style={{ cursor: editEnabled && !node.properties.locked ? 'crosshair' : 'default' }}
        >
          {lines.map((line, lineIndex) => {
            const color = line.color || currentLineColor;
            const selected = lineIndex === selectedLineIndex;
            if (!line.points || line.points.length < 2) return null;
            const points = line.points.map((point) => `${point.x * canvasWidth},${(1 - point.y) * canvasHeight}`).join(' ');
            return (
              <g key={line.varName || lineIndex} opacity={selected ? 1 : 0.45}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth={selected ? 2 : 1.5}
                  strokeLinejoin="round"
                />
                {line.points.map((point, pointIndex) => {
                  const isSelectedPoint = selected && pointIndex === selectedPointIndex;
                  return (
                    <circle
                      key={`${lineIndex}-${pointIndex}`}
                      cx={point.x * canvasWidth}
                      cy={(1 - point.y) * canvasHeight}
                      r={isSelectedPoint ? 4 : 3}
                      fill={isSelectedPoint ? '#ffffff' : color}
                      stroke="#0a0f1a"
                      strokeWidth={1}
                      onMouseDown={(event) => {
                        if (!editEnabled) return;
                        event.preventDefault();
                        event.stopPropagation();
                        setSelectedLineIndex(lineIndex);
                        setSelectedPointIndex(pointIndex);
                        dragRef.current = { lineIndex, pointIndex };
                      }}
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
  );
}
