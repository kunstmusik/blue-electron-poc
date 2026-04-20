import { describe, expect, it } from 'vitest';
import { getAuxiliaryEdgeDropTarget } from '../components/workbench/auxiliary-drag';

const bounds = {
  left: 0,
  top: 0,
  right: 1200,
  bottom: 800,
};

describe('getAuxiliaryEdgeDropTarget', () => {
  it('detects left, right, and bottom edge targets', () => {
    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 24,
        y: 220,
      }),
    ).toBe('left');

    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 1176,
        y: 220,
      }),
    ).toBe('right');

    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 620,
        y: 782,
      }),
    ).toBe('bottom');
  });

  it('prefers the nearest edge when hovering near a corner', () => {
    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 12,
        y: 720,
      }),
    ).toBe('left');

    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 620,
        y: 798,
      }),
    ).toBe('bottom');
  });

  it('returns undefined away from supported docking edges', () => {
    expect(
      getAuxiliaryEdgeDropTarget(bounds, {
        x: 600,
        y: 200,
      }),
    ).toBeUndefined();
  });
});
