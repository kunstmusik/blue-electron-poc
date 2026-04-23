import { create } from 'zustand';
import type { PlaybackClockSnapshot } from '../../shared/project-editor';

export type PlaybackStatus = 'idle' | 'starting' | 'playing' | 'stopping' | 'stopped' | 'error';

export type PlaybackClockSource = 'idle-anchor' | 'engine-authority' | 'interpolated';

export interface PlaybackClockState {
  sessionId: number;
  sampleFrames: number;
  sequence: number;
  sampleRate: number | null;
  ksmps: number | null;
  receivedAtMs: number;
}

export interface PlaybackDisplayState {
  sampleFrames: number;
  elapsedSeconds: number;
  source: PlaybackClockSource;
}

interface PlaybackState {
  isPlaying: boolean;
  status: PlaybackStatus;
  message: string;
  followPlayback: boolean;
  clock: PlaybackClockState | null;
  display: PlaybackDisplayState;
}

interface PlaybackActions {
  togglePlay: () => Promise<void>;
  stop: () => Promise<void>;
  setPlaying: (playing: boolean) => void;
  setStatus: (info: { status: string; message?: string }) => void;
  setError: (error: string) => void;
  acceptPlaybackClock: (snapshot: PlaybackClockSnapshot) => void;
  toggleFollowPlayback: () => void;
  reset: () => void;
}

let displayTimer: ReturnType<typeof setInterval> | null = null;

function stopDisplayTimer(): void {
  if (displayTimer) {
    clearInterval(displayTimer);
    displayTimer = null;
  }
}

function startDisplayTimer(): void {
  if (displayTimer) {
    return;
  }

  displayTimer = setInterval(() => {
    const state = usePlaybackStore.getState();
    const clock = state.clock;
    if (!clock || (state.status !== 'playing' && state.status !== 'stopping')) {
      stopDisplayTimer();
      return;
    }

    const sampleRate = clock.sampleRate && clock.sampleRate > 0 ? clock.sampleRate : null;
    const elapsedMs = Math.max(0, Date.now() - clock.receivedAtMs);
    const interpolatedFrames =
      sampleRate !== null
        ? clock.sampleFrames + (elapsedMs / 1000) * sampleRate
        : clock.sampleFrames;
    const elapsedSeconds =
      sampleRate !== null ? interpolatedFrames / sampleRate : interpolatedFrames;

    usePlaybackStore.setState((current) => ({
      ...current,
      display: {
        sampleFrames: interpolatedFrames,
        elapsedSeconds,
        source: elapsedMs > 0 ? 'interpolated' : 'engine-authority',
      },
    }));
  }, 33);
}

function createIdleDisplayState(): PlaybackDisplayState {
  return {
    sampleFrames: 0,
    elapsedSeconds: 0,
    source: 'idle-anchor',
  };
}

export const usePlaybackStore = create<PlaybackState & PlaybackActions>()((set, get) => ({
  isPlaying: false,
  status: 'idle',
  message: '',
  followPlayback: true,
  clock: null,
  display: createIdleDisplayState(),

  togglePlay: async () => {
    if (get().status === 'starting' || get().status === 'stopping') {
      return;
    }

    if (get().isPlaying) {
      await get().stop();
      return;
    }

    try {
      set({
        isPlaying: false,
        status: 'starting',
        message: 'Preparing playback...',
        clock: null,
        display: createIdleDisplayState(),
      });

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
    const shouldShowStopping =
      state.status === 'starting' || state.status === 'playing' || state.status === 'stopping';

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

    const nextState: Partial<PlaybackState> = {
      status: normalizedStatus,
      isPlaying: normalizedStatus === 'playing' || normalizedStatus === 'stopping',
      message: message || '',
    };

    if (normalizedStatus === 'starting') {
      nextState.clock = null;
      nextState.display = createIdleDisplayState();
      stopDisplayTimer();
    } else if (normalizedStatus === 'playing' || normalizedStatus === 'stopping') {
      if (get().clock) {
        startDisplayTimer();
      }
    } else {
      nextState.clock = null;
      nextState.display = createIdleDisplayState();
      stopDisplayTimer();
    }

    set(nextState);
  },

  setError: (error) => {
    stopDisplayTimer();
    set({
      status: 'error',
      isPlaying: false,
      message: error,
      clock: null,
      display: createIdleDisplayState(),
    });
  },

  acceptPlaybackClock: (snapshot) => {
    set((state) => {
      const currentClock = state.clock;
      if (
        currentClock &&
        currentClock.sessionId === snapshot.sessionId &&
        snapshot.sequence < currentClock.sequence
      ) {
        return state;
      }

      const sampleRate =
        snapshot.sampleRate ??
        currentClock?.sampleRate ??
        null;
      const ksmps = snapshot.ksmps ?? currentClock?.ksmps ?? null;
      const receivedAtMs = Date.now();
      const interpolatedSeconds = sampleRate && sampleRate > 0
        ? snapshot.sampleFrames / sampleRate
        : snapshot.sampleFrames;

      const nextState: PlaybackState = {
        ...state,
        clock: {
          sessionId: snapshot.sessionId,
          sampleFrames: snapshot.sampleFrames,
          sequence: snapshot.sequence,
          sampleRate,
          ksmps,
          receivedAtMs,
        },
        display: {
          sampleFrames: snapshot.sampleFrames,
          elapsedSeconds: interpolatedSeconds,
          source: 'engine-authority',
        },
      };

      if (state.status === 'playing' || state.status === 'stopping') {
        startDisplayTimer();
      }

      return nextState;
    });
  },

  toggleFollowPlayback: () => {
    set((state) => ({
      followPlayback: !state.followPlayback,
    }));
  },

  reset: () => {
    stopDisplayTimer();
    set({
      isPlaying: false,
      status: 'idle',
      message: '',
      followPlayback: true,
      clock: null,
      display: createIdleDisplayState(),
    });
  },
}));
