import type { AuxiliaryEdge } from './auxiliary-layout';

export interface AuxiliaryDragBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface AuxiliaryDragPoint {
  x: number;
  y: number;
}

export const AUXILIARY_EDGE_DRAG_THRESHOLD = 96;

export function getAuxiliaryEdgeDropTarget(
  bounds: AuxiliaryDragBounds,
  point: AuxiliaryDragPoint,
  threshold = AUXILIARY_EDGE_DRAG_THRESHOLD,
): AuxiliaryEdge | undefined {
  const withinVertical =
    point.y >= bounds.top - threshold && point.y <= bounds.bottom + threshold;
  const withinHorizontal =
    point.x >= bounds.left - threshold && point.x <= bounds.right + threshold;

  const candidates: Array<{ edge: AuxiliaryEdge; distance: number }> = [];

  if (withinVertical && point.x <= bounds.left + threshold) {
    candidates.push({
      edge: 'left',
      distance: Math.abs(point.x - bounds.left),
    });
  }

  if (withinVertical && point.x >= bounds.right - threshold) {
    candidates.push({
      edge: 'right',
      distance: Math.abs(bounds.right - point.x),
    });
  }

  if (withinHorizontal && point.y >= bounds.bottom - threshold) {
    candidates.push({
      edge: 'bottom',
      distance: Math.abs(bounds.bottom - point.y),
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0]?.edge;
}
