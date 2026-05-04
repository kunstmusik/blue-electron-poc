import { create } from 'zustand';

export interface ScoreObjectClipboardEntry {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  backgroundColor: number;
  isContainer: boolean;
  layerIndex: number;
  groupId: string;
}

interface ScoreSelectionState {
  selectedObjectIds: ReadonlySet<string>;
  clipboard: ScoreObjectClipboardEntry[];
  select: (objectId: string, additive: boolean) => void;
  selectAll: (allIds: string[]) => void;
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
  copySelected: (entries: ScoreObjectClipboardEntry[]) => void;
  clearClipboard: () => void;
}

export const useScoreSelectionStore = create<ScoreSelectionState>((set) => ({
  selectedObjectIds: new Set<string>(),
  clipboard: [],

  select(objectId, additive) {
    set((state) => {
      const next = new Set(state.selectedObjectIds);
      if (additive) {
        if (next.has(objectId)) {
          next.delete(objectId);
        } else {
          next.add(objectId);
        }
      } else {
        next.clear();
        next.add(objectId);
      }
      return { selectedObjectIds: next };
    });
  },

  selectAll(allIds) {
    set({ selectedObjectIds: new Set(allIds) });
  },

  clearSelection() {
    set({ selectedObjectIds: new Set() });
  },

  setSelection(ids) {
    set({ selectedObjectIds: new Set(ids) });
  },

  copySelected(entries) {
    set({ clipboard: entries });
  },

  clearClipboard() {
    set({ clipboard: [] });
  },
}));
