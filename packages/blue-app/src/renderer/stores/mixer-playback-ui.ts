import type { BlueLiveStatus } from '../types/global';

export interface MixerPlaybackUiState {
  isPlaying: boolean;
  isBlueLiveActive: boolean;
  canEvaluateEffects: boolean;
  statusLabel: string;
}

export function deriveMixerPlaybackUiState(options: {
  playbackStatus: string;
  blueLiveStatus: BlueLiveStatus;
}): MixerPlaybackUiState {
  const isPlaying = options.playbackStatus === 'playing' || options.playbackStatus === 'stopping';
  const isBlueLiveActive = options.blueLiveStatus === 'running';
  const canEvaluateEffects = isBlueLiveActive;

  const parts: string[] = [];
  if (isPlaying) parts.push('Playing');
  if (isBlueLiveActive) parts.push('Blue Live');
  if (!isPlaying && !isBlueLiveActive) parts.push('Idle');

  return {
    isPlaying,
    isBlueLiveActive,
    canEvaluateEffects,
    statusLabel: parts.join(' | '),
  };
}
