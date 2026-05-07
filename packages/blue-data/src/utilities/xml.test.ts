import { describe, expect, it } from 'vitest';
import { writeDouble } from './xml';

describe('xml utilities', () => {
  describe('writeDouble', () => {
    it('adds a decimal point for integer values', () => {
      expect(writeDouble('x', 0).getTextString()).toBe('0.0');
      expect(writeDouble('x', -3).getTextString()).toBe('-3.0');
    });

    it('preserves scientific notation and non-finite values', () => {
      expect(writeDouble('x', 1e-7).getTextString()).toBe('1e-7');
      expect(writeDouble('x', Infinity).getTextString()).toBe('Infinity');
      expect(writeDouble('x', NaN).getTextString()).toBe('NaN');
    });
  });
});
