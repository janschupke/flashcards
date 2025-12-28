import { describe, it, expect } from 'vitest';
import { getAnswerColorClass, getBorderColorClass } from './styleUtils';
import { InputVariant } from '../types/components';

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

  describe('getBorderColorClass', () => {
    it('returns border-success for SUCCESS variant', () => {
      expect(getBorderColorClass(InputVariant.SUCCESS)).toBe('border-success');
    });

    it('returns border-error for ERROR variant', () => {
      expect(getBorderColorClass(InputVariant.ERROR)).toBe('border-error');
    });

    it('returns border-border-secondary for DEFAULT variant', () => {
      expect(getBorderColorClass(InputVariant.DEFAULT)).toBe('border-border-secondary');
    });
  });
});

