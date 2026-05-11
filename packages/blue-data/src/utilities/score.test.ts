import { describe, it, expect } from 'vitest';
import { getNotes } from './score';

describe('ScoreUtilities.getNotes', () => {
  it('should parse simple score text', () => {
    const scoreText = 'i1 0 1 440';
    const notes = getNotes(scoreText);
    expect(notes.length).toBe(1);
    expect(notes.getNote(0).toScoreText()).toBe('i1\t0.0\t1\t440');
  });

  it('should parse score text with comments', () => {
    const scoreText = '; comment\ni1 0 1 440 ; another comment';
    const notes = getNotes(scoreText);
    expect(notes.length).toBe(1);
    expect(notes.getNote(0).toScoreText()).toBe('i1\t0.0\t1\t440');
  });

  it('should handle leading/trailing whitespace', () => {
    const scoreText = '   \ni1 0 1 440   \n';
    const notes = getNotes(scoreText);
    expect(notes.length).toBe(1);
  });
});
