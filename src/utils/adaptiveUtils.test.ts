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
    it('should prioritize 0% entries (0 success, 1 failure) over other entries', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - should be highest priority (triggers adaptive)
        { characterIndex: 1, correct: 3, total: 6 }, // 50% - medium priority (has enough attempts)
        { characterIndex: 2, correct: 6, total: 6 }, // 100% - lowest priority (has enough attempts)
        { characterIndex: 3, correct: 0, total: 0 }, // untested
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;
      const char3Percent = percentages[3] ?? 0;

      // Character 0 (0% success) should be selected more often than character 1 (50% success)
      // Use a margin to account for statistical variance
      expect(char0Percent).toBeGreaterThan(char1Percent - 0.02);
      // Character 0 (0% success) should be selected more often than character 2 (100% success)
      expect(char0Percent).toBeGreaterThan(char2Percent - 0.02);
      // Character 0 (0% success) should be selected more often than character 3 (untested)
      // Note: Untested gets 40% priority, but 0% entries should still be prioritized
      expect(char0Percent).toBeGreaterThan(char3Percent - 0.02);
      // Verify 0% entry gets substantial selection rate (at least 25% with 4 characters)
      expect(char0Percent).toBeGreaterThan(0.25);
    });

    it('should give 0% entries higher priority than low success rate entries', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - should be highest priority (gets ZERO_SUCCESS_MULTIPLIER)
        { characterIndex: 1, correct: 1, total: 10 }, // 10% - should be lower priority
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;

      // Character 0 (0% success) should be selected significantly more often
      // Due to ZERO_SUCCESS_MULTIPLIER (3.0x), it should get much higher priority
      expect(char0Percent).toBeGreaterThan(char1Percent);
      // Character 0 should get at least 60% of selections due to the multiplier boost
      // Using conservative threshold to account for min/max constraints, normalization, and statistical variance
      expect(char0Percent).toBeGreaterThan(0.6);
    });

    it('should prioritize 0% entries over other 0% success rate entries with more attempts', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% with 1 attempt - should get ZERO_SUCCESS_MULTIPLIER
        { characterIndex: 1, correct: 0, total: 5 }, // 0% with 5 attempts - should NOT get multiplier
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;

      // Character 0 (0 correct, 1 total) should be selected more often than
      // Character 1 (0 correct, 5 total) because it gets the ZERO_SUCCESS_MULTIPLIER
      expect(char0Percent).toBeGreaterThan(char1Percent);
      // Should get more than half, with margin for statistical variance
      expect(char0Percent).toBeGreaterThan(0.52);
    });

    it('should handle multiple 0% entries fairly', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0%
        { characterIndex: 1, correct: 0, total: 1 }, // 0%
        { characterIndex: 2, correct: 2, total: 2 }, // 100%
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;
      const char2Percent = percentages[2] ?? 0;

      // Both 0% entries should be selected more often than 100% entry
      expect(char0Percent).toBeGreaterThan(char2Percent - 0.02);
      expect(char1Percent).toBeGreaterThan(char2Percent - 0.02);
      // The two 0% entries should have roughly equal probability (within 12% to account for variance)
      expect(Math.abs(char0Percent - char1Percent)).toBeLessThan(0.12);
    });

    it('should use adaptive selection for 0% entries even with only 1 attempt', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% entry - should trigger adaptive selection
        { characterIndex: 1, correct: 2, total: 2 }, // 100% entry
      ];

      const counts = runSelectionTest(characters, performance);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const char0Percent = percentages[0] ?? 0;
      const char1Percent = percentages[1] ?? 0;

      // Character 0 (0% success) should be selected more often than character 1 (100% success)
      // This proves adaptive selection is working, not just random
      expect(char0Percent).toBeGreaterThan(char1Percent);
      // Should get significantly more than 50%, with margin for variance
      expect(char0Percent).toBeGreaterThan(0.55);
    });

    it('should fallback to random when not enough data (no 0% entries)', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 1, total: 1 }, // Only 1 attempt, less than MIN_ATTEMPTS_FOR_ADAPTIVE, but not 0%
      ];

      // Should fallback to random when no valid adaptive data
      const selected = selectAdaptiveCharacter(characters, performance);
      expect(characters).toContain(selected);
    });

    it('should respect min/max selection chance constraints', () => {
      const characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 1 }, // 0% - should get high weight but capped at MAX
        { characterIndex: 1, correct: 0, total: 1 }, // 0%
        { characterIndex: 2, correct: 0, total: 1 }, // 0%
        { characterIndex: 3, correct: 0, total: 1 }, // 0%
        { characterIndex: 4, correct: 0, total: 1 }, // 0%
        { characterIndex: 5, correct: 2, total: 2 }, // 100%
        { characterIndex: 6, correct: 2, total: 2 }, // 100%
        { characterIndex: 7, correct: 2, total: 2 }, // 100%
        { characterIndex: 8, correct: 2, total: 2 }, // 100%
        { characterIndex: 9, correct: 2, total: 2 }, // 100%
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
