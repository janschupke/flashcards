import { describe, it, expect } from 'vitest';
import { cn } from './classNameUtils';

describe('classNameUtils', () => {
  describe('cn', () => {
    it('should join string classes', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, 'class3', false)).toBe('class1 class2 class3');
    });

    it('should handle empty strings', () => {
      expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('should handle object with boolean values', () => {
      expect(cn({ active: true, disabled: false, visible: true })).toBe('active visible');
    });

    it('should handle mixed string and object inputs', () => {
      expect(cn('base', { active: true, disabled: false }, 'extra')).toBe('base active extra');
    });

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should filter falsy values from arrays', () => {
      expect(cn(['class1', null, 'class2', undefined], 'class3')).toBe('class1 class2 class3');
    });

    it('should handle complex combinations', () => {
      expect(
        cn(
          'base',
          { active: true, disabled: false },
          ['array1', 'array2'],
          null,
          'final',
          { hidden: false }
        )
      ).toBe('base active array1 array2 final');
    });

    it('should return empty string for all falsy inputs', () => {
      expect(cn(null, undefined, false, '')).toBe('');
    });

    it('should handle single class', () => {
      expect(cn('single')).toBe('single');
    });

    it('should handle no arguments', () => {
      expect(cn()).toBe('');
    });
  });
});


