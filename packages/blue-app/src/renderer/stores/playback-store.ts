import { create } from 'zustand';

export type PlaybackStatus = 'idle' | 'playing' | 'error';

interface PlaybackState {
  isPlaying: boolean;
  status: PlaybackStatus;
  message: string;
}

interface PlaybackActions {
  setPlaying: (playing: boolean) => void;
  setStatus: (info: { status: string; message?: string }) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState & PlaybackActions>()((set) => ({
  isPlaying: false,
  status: 'idle',
  message: '',

  setPlaying: (isPlaying) => set({ isPlaying }),

  setStatus: ({ status, message }) =>
    set({
      status: status as PlaybackStatus,
      isPlaying: status === 'playing',
      message: message || '',
    }),

  setError: (error) =>
    set({
      status: 'error',
      isPlaying: false,
      message: error,
    }),

  reset: () => set({ isPlaying: false, status: 'idle', message: '' }),
}));
