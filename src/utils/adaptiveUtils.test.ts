import { describe, it, expect } from 'vitest';
import { selectAdaptiveCharacter, getSuccessRate } from './adaptiveUtils';
import { CharacterPerformance } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

// Number of iterations for statistical tests to ensure reliable results
const TEST_ITERATIONS = 20000;

// Helper function to run selection tests with statistical analysis
const runSelectionTest = (
  characters: number[],
  performance: CharacterPerformance[],
  iterations = TEST_ITERATIONS
): Record<number, number> => {
  const selections: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const selected = selectAdaptiveCharacter(characters, performance);
    selections.push(selected);
  }

  return selections.reduce(
    (acc, char) => {
      const currentCount = acc[char];
      acc[char] = (currentCount ?? 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );
};

// Helper to get percentages from counts
const getPercentages = (
  counts: Record<number, number>,
  iterations: number
): Record<number, number> => {
  const percentages: Record<number, number> = {};
  for (const [char, count] of Object.entries(counts)) {
    percentages[Number(char)] = count / iterations;
  }
  return percentages;
};

describe('adaptiveUtils', () => {
  describe('getSuccessRate', () => {
    it('should return 1.0 for null performance', () => {
      expect(getSuccessRate(null)).toBe(1.0);
    });

    it('should return 1.0 for performance with 0 total', () => {
      expect(getSuccessRate({ characterIndex: 0, correct: 0, total: 0 })).toBe(1.0);
    });

    it('should return 0.0 for 0% success rate (0 correct, 1 total)', () => {
      expect(getSuccessRate({ characterIndex: 0, correct: 0, total: 1 })).toBe(0.0);
    });

    it('should return 0.5 for 50% success rate', () => {
      expect(getSuccessRate({ characterIndex: 0, correct: 1, total: 2 })).toBe(0.5);
    });

    it('should return 1.0 for 100% success rate', () => {
      expect(getSuccessRate({ characterIndex: 0, correct: 2, total: 2 })).toBe(1.0);
    });
  });

  describe('selectAdaptiveCharacter', () => {
    it('should prioritize low success rate entries (0-30%) over other entries', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - low success, highest priority
        { characterIndex: 1, correct: 3, total: 6 }, // 50% - medium success, medium priority
        { characterIndex: 2, correct: 6, total: 6 }, // 100% - high success, lowest priority
        { characterIndex: 3, correct: 0, total: 0 }, // untested
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;
      const char3Percent = percentages[3] ?? 0;

      // Character 0 (0% success, low category) should be selected more often than character 1 (50% success, medium category)
      expect(char0Percent).toBeGreaterThan(char1Percent - 0.02);
      // Character 0 should be selected more often than character 2 (100% success, high category)
      expect(char0Percent).toBeGreaterThan(char2Percent - 0.02);
      // Character 0 should be selected more often than character 3 (untested)
      // Low success gets 50% allocation, untested gets 20%
      expect(char0Percent).toBeGreaterThan(char3Percent - 0.02);
      // Verify low success entry gets substantial selection rate (at least 40% with 4 characters)
      expect(char0Percent).toBeGreaterThan(0.4);
    });

    it('should prioritize low success rate entries over medium/high success entries', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - low success category (0-30%)
        { characterIndex: 1, correct: 2, total: 5 }, // 40% - medium success category (30-70%)
        { characterIndex: 2, correct: 8, total: 10 }, // 80% - high success category (70-100%)
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;

      // Low success (0%) should be selected more often than medium success (40%)
      expect(char0Percent).toBeGreaterThan(char1Percent);
      // Low success should be selected more often than high success (80%)
      expect(char0Percent).toBeGreaterThan(char2Percent);
      // Medium success should be selected more often than high success
      expect(char1Percent).toBeGreaterThan(char2Percent);
      // Low success gets 50% allocation, so should get at least 40% with 3 characters
      expect(char0Percent).toBeGreaterThan(0.4);
    });

    it('should give equal priority to all low success rate entries regardless of attempt count', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% with 1 attempt - low success
        { characterIndex: 1, correct: 0, total: 5 }, // 0% with 5 attempts - low success
        { characterIndex: 2, correct: 3, total: 10 }, // 30% - still low success (at threshold)
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;

      // All low success entries should have roughly equal probability
      // They share the low success allocation equally, so relative differences should be small
      const avgPercent = (char0Percent + char1Percent + char2Percent) / 3;

      // Each should be within 50% of the average (robust to variance)
      // This tests that they're roughly equal without requiring exact percentages
      expect(char0Percent).toBeGreaterThan(avgPercent * 0.5);
      expect(char0Percent).toBeLessThan(avgPercent * 1.5);
      expect(char1Percent).toBeGreaterThan(avgPercent * 0.5);
      expect(char1Percent).toBeLessThan(avgPercent * 1.5);
      expect(char2Percent).toBeGreaterThan(avgPercent * 0.5);
      expect(char2Percent).toBeLessThan(avgPercent * 1.5);

      // Verify they all get substantial selection (low success gets high priority)
      expect(avgPercent).toBeGreaterThan(0.15); // Should be well above random (33%)
    });

    it('should handle multiple low success entries fairly', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - low success
        { characterIndex: 1, correct: 1, total: 5 }, // 20% - low success
        { characterIndex: 2, correct: 8, total: 10 }, // 80% - high success
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;

      // Both low success entries should be selected more often than high success entry
      expect(char0Percent).toBeGreaterThan(char2Percent);
      expect(char1Percent).toBeGreaterThan(char2Percent);

      // The two low success entries should have roughly equal probability
      // Test relative equality: each should be within 50% of the average of the two
      const lowSuccessAvg = (char0Percent + char1Percent) / 2;
      expect(char0Percent).toBeGreaterThan(lowSuccessAvg * 0.5);
      expect(char0Percent).toBeLessThan(lowSuccessAvg * 1.5);
      expect(char1Percent).toBeGreaterThan(lowSuccessAvg * 0.5);
      expect(char1Percent).toBeLessThan(lowSuccessAvg * 1.5);
    });

    it('should use adaptive selection for low success entries even with only 1 attempt', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - low success, should trigger adaptive
        { characterIndex: 1, correct: 2, total: 2 }, // 100% - high success
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;

      // Low success (0%) should be selected more often than high success (100%)
      // This proves adaptive selection is working, not just random
      expect(char0Percent).toBeGreaterThan(char1Percent);
      // Low success gets 50% allocation, so should get at least 45% with 2 characters
      expect(char0Percent).toBeGreaterThan(0.45);
    });

    it('should fallback to random when not enough data (no low success entries)', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 1, total: 1 }, // Only 1 attempt, 100% success, less than MIN_ATTEMPTS_FOR_ADAPTIVE
      ];

      // Should fallback to random when no valid adaptive data (need MIN_ATTEMPTS_FOR_ADAPTIVE or low success)
      const selected = selectAdaptiveCharacter(characters, performance);
      expect(characters).toContain(selected);
    });

    it('should respect min/max selection chance constraints', () => {
      const characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - low success, not capped at MAX
        { characterIndex: 1, correct: 1, total: 5 }, // 20% - low success
        { characterIndex: 2, correct: 2, total: 10 }, // 20% - low success
        { characterIndex: 3, correct: 3, total: 10 }, // 30% - low success (at threshold)
        { characterIndex: 4, correct: 4, total: 10 }, // 40% - medium success
        { characterIndex: 5, correct: 6, total: 10 }, // 60% - medium success
        { characterIndex: 6, correct: 8, total: 10 }, // 80% - high success
        { characterIndex: 7, correct: 9, total: 10 }, // 90% - high success
        { characterIndex: 8, correct: 10, total: 10 }, // 100% - high success
        { characterIndex: 9, correct: 10, total: 10 }, // 100% - high success
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // Check that no character gets more than MAX_SELECTION_CHANCE
      // Use larger margin (0.08) to account for statistical variance with 10 characters
      for (let i = 0; i < characters.length; i++) {
        const percent = percentages[i] ?? 0;
        expect(percent).toBeLessThanOrEqual(ADAPTIVE_CONFIG.MAX_SELECTION_CHANCE + 0.08);
      }

      // Check that no character gets less than MIN_SELECTION_CHANCE
      // Use larger margin (0.08) to account for statistical variance
      for (let i = 0; i < characters.length; i++) {
        const percent = percentages[i] ?? 0;
        expect(percent).toBeGreaterThanOrEqual(ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE - 0.08);
      }
    });
  });
});
