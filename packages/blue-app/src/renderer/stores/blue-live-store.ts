import { create } from 'zustand';
import type { BlueLiveStatus, BlueLiveStatusSnapshot } from '../types/global';

interface BlueLiveState {
  status: BlueLiveStatus;
  running: boolean;
  message: string;
  sessionId: number;
  projectRevision: number | null;
  initialized: boolean;
}

interface BlueLiveActions {
  setStatusFromSnapshot: (snapshot: BlueLiveStatusSnapshot) => void;
  reset: () => void;
}

type BlueLiveStore = BlueLiveState & BlueLiveActions;

const initialState: BlueLiveState = {
  status: 'idle',
  running: false,
  message: '',
  sessionId: 0,
  projectRevision: null,
  initialized: false,
};

export const useBlueLiveStore = create<BlueLiveStore>((set) => ({
  ...initialState,

  setStatusFromSnapshot: (snapshot: BlueLiveStatusSnapshot) => {
    set({
      status: snapshot.status,
      running: snapshot.running,
      message: snapshot.message ?? '',
      sessionId: snapshot.sessionId,
      projectRevision: snapshot.projectRevision ?? null,
      initialized: true,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
