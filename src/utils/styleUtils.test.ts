import { describe, it, expect } from 'vitest';
import { getAnswerColorClass } from './styleUtils';

describe('styleUtils', () => {
  describe('getAnswerColorClass', () => {
    it('returns text-text-secondary when isCorrect is null', () => {
      expect(getAnswerColorClass(null)).toBe('text-text-secondary');
    });

    it('returns text-success when isCorrect is true', () => {
      expect(getAnswerColorClass(true)).toBe('text-success');
    });

    it('returns text-error when isCorrect is false', () => {
      expect(getAnswerColorClass(false)).toBe('text-error');
    });
  });
});
