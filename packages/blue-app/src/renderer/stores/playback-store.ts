import { create } from 'zustand';

export type PlaybackStatus = 'idle' | 'playing' | 'error';

interface PlaybackState {
  isPlaying: boolean;
  status: PlaybackStatus;
  message: string;
}

interface PlaybackActions {
  togglePlay: () => Promise<void>;
  stop: () => void;
  setPlaying: (playing: boolean) => void;
  setStatus: (info: { status: string; message?: string }) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState & PlaybackActions>()((set, get) => ({
  isPlaying: false,
  status: 'idle',
  message: '',

  togglePlay: async () => {
    if (get().isPlaying) {
      get().stop();
      return;
    }
    try {
      const playing = await window.blueAPI.togglePlay();
      set({
        isPlaying: playing,
        status: playing ? 'playing' : 'idle',
        message: playing ? 'Playing via blue-engine' : '',
      });
    } catch (err: unknown) {
      get().setError(err instanceof Error ? err.message : String(err));
    }
  },

  stop: () => {
    window.blueAPI.stopPlayback();
    set({ isPlaying: false, status: 'idle', message: '' });
  },

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
