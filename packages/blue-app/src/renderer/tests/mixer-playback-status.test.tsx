import { describe, expect, it } from 'vitest';
import { deriveMixerPlaybackUiState } from '../stores/mixer-playback-ui';
import type { MixerPlaybackUiState } from '../stores/mixer-playback-ui';

describe('deriveMixerPlaybackUiState', () => {
  it('returns idle state when nothing is active', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopped',
      blueLiveStatus: 'idle',
    });

    expect(result.isPlaying).toBe(false);
    expect(result.isBlueLiveActive).toBe(false);
    expect(result.canEvaluateEffects).toBe(false);
    expect(result.statusLabel).toBe('Idle');
  });

  it('returns playing state when playbackStatus is playing', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'playing',
      blueLiveStatus: 'idle',
    });

    expect(result.isPlaying).toBe(true);
    expect(result.isBlueLiveActive).toBe(false);
    expect(result.canEvaluateEffects).toBe(false);
    expect(result.statusLabel).toContain('Playing');
  });

  it('returns blue live active when blueLiveStatus is running', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopped',
      blueLiveStatus: 'running',
    });

    expect(result.isPlaying).toBe(false);
    expect(result.isBlueLiveActive).toBe(true);
    expect(result.canEvaluateEffects).toBe(true);
  });

  it('returns both playing and blue live active when both are active', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'playing',
      blueLiveStatus: 'running',
    });

    expect(result.isPlaying).toBe(true);
    expect(result.isBlueLiveActive).toBe(true);
    expect(result.canEvaluateEffects).toBe(true);
    expect(result.statusLabel).toContain('Playing');
    expect(result.statusLabel).toContain('Blue Live');
  });

  it('treats stopping playback as still playing', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopping',
      blueLiveStatus: 'idle',
    });

    expect(result.isPlaying).toBe(true);
    expect(result.statusLabel).toContain('Playing');
  });

  it('treats starting blue live as not yet active', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopped',
      blueLiveStatus: 'starting',
    });

    expect(result.isBlueLiveActive).toBe(false);
    expect(result.canEvaluateEffects).toBe(false);
    expect(result.statusLabel).toBe('Idle');
  });

  it('treats stopped blue live as not active', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopped',
      blueLiveStatus: 'stopped',
    });

    expect(result.isBlueLiveActive).toBe(false);
    expect(result.canEvaluateEffects).toBe(false);
    expect(result.statusLabel).toBe('Idle');
  });

  it('treats error blue live as not active', () => {
    const result = deriveMixerPlaybackUiState({
      playbackStatus: 'stopped',
      blueLiveStatus: 'error',
    });

    expect(result.isBlueLiveActive).toBe(false);
    expect(result.canEvaluateEffects).toBe(false);
    expect(result.statusLabel).toBe('Idle');
  });
});
