import { create } from 'zustand';

export type PlaybackStatus = 'idle' | 'starting' | 'playing' | 'stopping' | 'stopped' | 'error';

interface PlaybackState {
  isPlaying: boolean;
  status: PlaybackStatus;
  message: string;
}

interface PlaybackActions {
  togglePlay: () => Promise<void>;
  stop: () => Promise<void>;
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
    if (get().status === 'starting' || get().status === 'stopping') {
      return;
    }

    if (get().isPlaying) {
      await get().stop();
      return;
    }

    try {
      set({ isPlaying: false, status: 'starting', message: 'Preparing playback...' });

      const playing = await window.blueAPI.togglePlay();

      if (get().status === 'starting') {
        set({
          isPlaying: playing,
          status: playing ? 'playing' : 'stopped',
          message: playing ? 'Playing via blue-engine' : '',
        });
      }
    } catch (err: unknown) {
      get().setError(err instanceof Error ? err.message : String(err));
    }
  },

  stop: async () => {
    const state = get();
    const shouldShowStopping = state.status === 'starting' || state.status === 'playing' || state.status === 'stopping';

    if (shouldShowStopping) {
      set({
        isPlaying: state.isPlaying,
        status: 'stopping',
        message: 'Stopping playback...',
      });
    }

    await window.blueAPI.stopPlayback();
  },

  setPlaying: (isPlaying) => set({ isPlaying }),

  setStatus: ({ status, message }) => {
    const normalizedStatus: PlaybackStatus =
      status === 'starting' || status === 'playing' || status === 'stopping' || status === 'stopped' || status === 'error'
        ? status
        : 'idle';

    set({
      status: normalizedStatus,
      isPlaying: normalizedStatus === 'playing' || normalizedStatus === 'stopping',
      message: message || '',
    });
  },

  setError: (error) =>
    set({
      status: 'error',
      isPlaying: false,
      message: error,
    }),

  reset: () => set({ isPlaying: false, status: 'idle', message: '' }),
}));
