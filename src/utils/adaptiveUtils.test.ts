import { describe, it, expect } from 'vitest';
import { selectAdaptiveCharacter, getSuccessRate } from './adaptiveUtils';
import { CharacterPerformance } from '../types/storage';

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
    it('should select unsuccessful or new characters 70% of the time', () => {
      const characters = [0, 1, 2, 3, 4, 5];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
        { characterIndex: 1, correct: 1, total: 5 }, // 20% - unsuccessful
        { characterIndex: 2, correct: 0, total: 0 }, // 0 attempts - untested
        { characterIndex: 3, correct: 0, total: 0 }, // 0 attempts - untested
        { characterIndex: 4, correct: 8, total: 10 }, // 80% - successful
        { characterIndex: 5, correct: 9, total: 10 }, // 90% - successful
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // Calculate combined percentage for unsuccessful or new
      const unsuccessfulOrNewPercent =
        (percentages[0] ?? 0) +
        (percentages[1] ?? 0) +
        (percentages[2] ?? 0) +
        (percentages[3] ?? 0);

      // Should be approximately 70% (with tolerance for statistical variance)
      expect(unsuccessfulOrNewPercent).toBeGreaterThan(0.65);
      expect(unsuccessfulOrNewPercent).toBeLessThan(0.75);
    });

    it('should prioritize unsuccessful over untested characters', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
        // Character 1 is untested (no performance data)
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // Unsuccessful should be selected more often than untested
      expect(percentages[0] ?? 0).toBeGreaterThan(percentages[1] ?? 0);
    });

    it('should prioritize unsuccessful/new over successful characters', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
        { characterIndex: 1, correct: 0, total: 0 }, // untested
        { characterIndex: 2, correct: 8, total: 10 }, // 80% - successful
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const unsuccessfulOrNewPercent = (percentages[0] ?? 0) + (percentages[1] ?? 0);
      const successfulPercent = percentages[2] ?? 0;

      // Unsuccessful/new should be selected more often (70% vs 30%)
      expect(unsuccessfulOrNewPercent).toBeGreaterThan(successfulPercent);
    });

    it('should handle single character', () => {
      const characters = [0];
      const performance: CharacterPerformance[] = [{ characterIndex: 0, correct: 5, total: 10 }];

      // Run multiple selections
      for (let i = 0; i < 100; i++) {
        const selected = selectAdaptiveCharacter(characters, performance);
        expect(selected).toBe(0);
      }
    });

    it('should fallback to random when not enough data', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 1, total: 1 }, // Only 1 attempt, 100% success
      ];

      // Should fallback to random when no valid adaptive data
      const selected = selectAdaptiveCharacter(characters, performance);
      expect(characters).toContain(selected);
    });
  });

  describe('Empty groups handling', () => {
    it('should select all characters when all are untested', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = []; // No performance data

      // All characters should be selectable (weights > 0)
      const selections = new Set<number>();
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const selected = selectAdaptiveCharacter(characters, performance);
        selections.add(selected);
      }

      // All characters should be selected at least once
      characters.forEach((charIndex) => {
        expect(selections.has(charIndex)).toBe(true);
      });
    });

    it('should select all characters when all are successful', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 10, total: 10 }, // 100%
        { characterIndex: 1, correct: 9, total: 10 }, // 90%
        { characterIndex: 2, correct: 8, total: 10 }, // 80%
        { characterIndex: 3, correct: 7, total: 10 }, // 70%
      ];

      // All characters should be selectable (weights > 0)
      const selections = new Set<number>();
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const selected = selectAdaptiveCharacter(characters, performance);
        selections.add(selected);
      }

      // All characters should be selected at least once
      characters.forEach((charIndex) => {
        expect(selections.has(charIndex)).toBe(true);
      });
    });

    it('should maintain 70/30 split when both groups have characters', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
        { characterIndex: 1, correct: 0, total: 0 }, // untested
        { characterIndex: 2, correct: 8, total: 10 }, // 80% - successful
        { characterIndex: 3, correct: 9, total: 10 }, // 90% - successful
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);
      const unsuccessfulOrUntestedPercent = (percentages[0] ?? 0) + (percentages[1] ?? 0);
      expect(unsuccessfulOrUntestedPercent).toBeGreaterThan(0.65);
      expect(unsuccessfulOrUntestedPercent).toBeLessThan(0.75);
    });
  });

  describe('Same success rate handling', () => {
    it('should handle all unsuccessful characters with 0% success', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0%
        { characterIndex: 1, correct: 0, total: 5 }, // 0%
        { characterIndex: 2, correct: 0, total: 5 }, // 0%
        { characterIndex: 3, correct: 0, total: 5 }, // 0%
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // All should be selected (weights > 0)
      characters.forEach((charIndex) => {
        expect(percentages[charIndex] ?? 0).toBeGreaterThan(0);
      });
    });

    it('should handle all successful characters with 100% success', () => {
      const characters = [0, 1, 2, 3];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 10, total: 10 }, // 100%
        { characterIndex: 1, correct: 10, total: 10 }, // 100%
        { characterIndex: 2, correct: 10, total: 10 }, // 100%
        { characterIndex: 3, correct: 10, total: 10 }, // 100%
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // All should be selected (minimum weight ensures selection)
      characters.forEach((charIndex) => {
        expect(percentages[charIndex] ?? 0).toBeGreaterThan(0);
      });
    });
  });
});
