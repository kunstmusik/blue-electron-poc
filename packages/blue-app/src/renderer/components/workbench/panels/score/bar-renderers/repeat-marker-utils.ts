import type { CSSProperties } from 'react';

export interface RepeatMarkerGeometry {
  triangles: Array<{
    x: number;
    yTop: number;
    yBottom: number;
  }>;
}

export function computeRepeatMarkers(
  repeatPointBeats: number | null,
  durationBeats: number,
  pixelsPerBeat: number,
  barHeight: number,
): RepeatMarkerGeometry {
  if (repeatPointBeats == null || !Number.isFinite(repeatPointBeats) || repeatPointBeats <= 0) {
    return { triangles: [] };
  }

  const markerHeight = Math.max(0, barHeight - 4);
  if (markerHeight <= 0) {
    return { triangles: [] };
  }

  const triangles: RepeatMarkerGeometry['triangles'] = [];
  let lineTime = repeatPointBeats;

  while (lineTime <= durationBeats && Number.isFinite(lineTime) && triangles.length < 500) {
    const lineX = Math.trunc(lineTime * pixelsPerBeat);
    triangles.push({ x: lineX, yTop: 0, yBottom: markerHeight });
    lineTime += repeatPointBeats;
  }

  return { triangles };
}

export function repeatMarkerClipStyle(): CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  };
}
