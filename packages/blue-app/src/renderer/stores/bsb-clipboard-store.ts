import { create } from 'zustand';
import type { BsbWidgetNodeSnapshot } from '../../shared/project-editor';

export interface BsbCanvasClipboard {
  widgets: BsbWidgetNodeSnapshot[];
  originX: number;
  originY: number;
}

interface BsbClipboardState {
  clipboard: BsbCanvasClipboard | null;
  setClipboard: (clipboard: BsbCanvasClipboard | null) => void;
  clearClipboard: () => void;
}

function cloneClipboard(clipboard: BsbCanvasClipboard | null): BsbCanvasClipboard | null {
  if (!clipboard) {
    return null;
  }

  return {
    originX: clipboard.originX,
    originY: clipboard.originY,
    widgets: clipboard.widgets.map((widget) =>
      JSON.parse(JSON.stringify(widget)) as BsbWidgetNodeSnapshot),
  };
}

export const useBsbClipboardStore = create<BsbClipboardState>((set) => ({
  clipboard: null,
  setClipboard: (clipboard) => set({ clipboard: cloneClipboard(clipboard) }),
  clearClipboard: () => set({ clipboard: null }),
}));
