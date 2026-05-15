import { create } from 'zustand';

interface UndoEdit {
  label: string;
  undo: () => void;
  redo: () => void;
}

interface PianoRollUndoState {
  undoStack: UndoEdit[];
  redoStack: UndoEdit[];
  pushEdit: (edit: UndoEdit) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const usePianoRollUndoStore = create<PianoRollUndoState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  pushEdit: (edit) =>
    set((state) => ({
      undoStack: [...state.undoStack, edit],
      redoStack: [],
    })),

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const edit = undoStack[undoStack.length - 1]!;
    edit.undo();
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, edit],
    }));
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const edit = redoStack[redoStack.length - 1]!;
    edit.redo();
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, edit],
    }));
  },

  clear: () => set({ undoStack: [], redoStack: [] }),
}));
