import { describe, it, expect } from 'vitest';
import {
  calculateSuccessRate,
  formatSuccessRatePercent,
  getSuccessRateColorClass,
} from './statisticsUtils';
import { SUCCESS_RATE_THRESHOLDS } from '../constants';

describe('statisticsUtils', () => {
  describe('calculateSuccessRate', () => {
    it('should return 0 when total is 0', () => {
      expect(calculateSuccessRate(0, 0)).toBe(0);
      expect(calculateSuccessRate(5, 0)).toBe(0);
    });

    it('should calculate correct success rate', () => {
      expect(calculateSuccessRate(10, 20)).toBe(0.5);
      expect(calculateSuccessRate(8, 10)).toBe(0.8);
      expect(calculateSuccessRate(5, 10)).toBe(0.5);
      expect(calculateSuccessRate(10, 10)).toBe(1.0);
      expect(calculateSuccessRate(0, 10)).toBe(0.0);
    });

    it('should handle decimal results', () => {
      expect(calculateSuccessRate(1, 3)).toBeCloseTo(0.333, 2);
      expect(calculateSuccessRate(2, 3)).toBeCloseTo(0.667, 2);
    });
  });

  describe('formatSuccessRatePercent', () => {
    it('should format with default 1 decimal place', () => {
      expect(formatSuccessRatePercent(0.5)).toBe('50.0');
      expect(formatSuccessRatePercent(0.85)).toBe('85.0');
      expect(formatSuccessRatePercent(0.123)).toBe('12.3');
    });

    it('should format with custom decimal places', () => {
      expect(formatSuccessRatePercent(0.5, 0)).toBe('50');
      expect(formatSuccessRatePercent(0.123, 2)).toBe('12.30');
      expect(formatSuccessRatePercent(0.1234, 3)).toBe('12.340');
    });

    it('should handle edge cases', () => {
      expect(formatSuccessRatePercent(0)).toBe('0.0');
      expect(formatSuccessRatePercent(1)).toBe('100.0');
      expect(formatSuccessRatePercent(0.999)).toBe('99.9');
    });
  });

  describe('getSuccessRateColorClass', () => {
    it('should return success class for mastered rate (>= 0.8)', () => {
      expect(getSuccessRateColorClass(0.8)).toBe('text-success');
      expect(getSuccessRateColorClass(0.9)).toBe('text-success');
      expect(getSuccessRateColorClass(1.0)).toBe('text-success');
      expect(getSuccessRateColorClass(SUCCESS_RATE_THRESHOLDS.MASTERED)).toBe('text-success');
    });

    it('should return warning class for learning rate (0.5-0.79)', () => {
      expect(getSuccessRateColorClass(0.5)).toBe('text-warning');
      expect(getSuccessRateColorClass(0.6)).toBe('text-warning');
      expect(getSuccessRateColorClass(0.79)).toBe('text-warning');
      expect(getSuccessRateColorClass(SUCCESS_RATE_THRESHOLDS.LEARNING)).toBe('text-warning');
    });

    it('should return error class for struggling rate (< 0.5)', () => {
      expect(getSuccessRateColorClass(0.0)).toBe('text-error');
      expect(getSuccessRateColorClass(0.1)).toBe('text-error');
      expect(getSuccessRateColorClass(0.49)).toBe('text-error');
      expect(getSuccessRateColorClass(0.4)).toBe('text-error');
    });

    it('should handle boundary values correctly', () => {
      expect(getSuccessRateColorClass(0.499)).toBe('text-error');
      expect(getSuccessRateColorClass(0.5)).toBe('text-warning');
      expect(getSuccessRateColorClass(0.799)).toBe('text-warning');
      expect(getSuccessRateColorClass(0.8)).toBe('text-success');
    });
  });
});
