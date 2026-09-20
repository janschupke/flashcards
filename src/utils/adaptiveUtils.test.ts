import { describe, it, expect } from 'vitest';
import {
  selectAdaptiveCharacter,
  getSuccessRate,
  getSuccessRateOrNull,
  getTier,
  calculateCharacterWeights,
} from './adaptiveUtils';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
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
    it('should select unsuccessful or new characters 80% of the time', () => {
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

      // Should be approximately 80% (with tolerance for statistical variance)
      expect(unsuccessfulOrNewPercent).toBeGreaterThan(0.75);
      expect(unsuccessfulOrNewPercent).toBeLessThan(0.85);
    });

    it('should prioritize struggling over untested characters', () => {
      const characters = [0, 1];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 5 }, // 0% - struggling
        // Character 1 is untested (no performance data)
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // The struggling tier holds a larger share than the untested tier. Under
      // the old two-group split the opposite held: a flat untested weight of
      // 1.0 beat a struggling card's maximum of 0.667, so the card you had
      // just got wrong was the least likely card in the pool.
      expect(percentages[0] ?? 0).toBeGreaterThan(percentages[1] ?? 0);
    });

    it('draws a freshly-missed character more often than its untested neighbours', () => {
      // The specific case the About page promises and the old algorithm broke:
      // one card answered wrong once, in a range of otherwise-untested cards.
      const characters = Array.from({ length: 20 }, (_, i) => i);
      const performance: CharacterPerformance[] = [{ characterIndex: 0, correct: 0, total: 1 }];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      const missed = percentages[0] ?? 0;
      const untestedAverage =
        characters.slice(1).reduce((sum, i) => sum + (percentages[i] ?? 0), 0) /
        (characters.length - 1);

      expect(missed).toBeGreaterThan(untestedAverage);
    });

    it('never returns the excluded character when others are available', () => {
      const characters = [0, 1, 2];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 2 }, // would otherwise dominate
        { characterIndex: 1, correct: 10, total: 10 },
        { characterIndex: 2, correct: 10, total: 10 },
      ];

      for (let i = 0; i < 300; i++) {
        expect(selectAdaptiveCharacter(characters, performance, 0)).not.toBe(0);
      }
    });

    it('falls back to the full range when every candidate is excluded', () => {
      expect(selectAdaptiveCharacter([7], [{ characterIndex: 7, correct: 0, total: 1 }], 7)).toBe(
        7
      );
    });

    it('bounds how much of a tier a single struggling character can take', () => {
      // One failing card among mastered ones used to take the whole
      // struggling-or-untested budget and repeat back to back.
      const characters = [0, 1, 2, 3, 4];
      const performance: CharacterPerformance[] = [
        { characterIndex: 0, correct: 0, total: 2 },
        ...[1, 2, 3, 4].map((characterIndex) => ({ characterIndex, correct: 10, total: 10 })),
      ];

      const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
      const percentages = getPercentages(counts, TEST_ITERATIONS);

      // getPercentages returns a fraction of 1, not a percent.
      // It should lead, but not monopolise: the struggling tier is the only
      // populated one besides mastered, so its share is 0.5/0.7 ~= 0.71.
      expect(percentages[0] ?? 0).toBeGreaterThan(0.5);
      expect(percentages[0] ?? 0).toBeLessThan(0.85);
    });

    it('survives a corrupt performance record instead of pinning to one character', () => {
      // A record missing `total` used to produce NaN weights, making the
      // cumulative loop fall through to the last character on every draw.
      const characters = [0, 1, 2, 3];
      const performance = [
        { characterIndex: 0, correct: 1 },
        { characterIndex: 1, correct: 0, total: 2 },
      ] as CharacterPerformance[];

      const counts = runSelectionTest(characters, performance, 400);
      const distinct = Object.values(counts).filter((c) => c > 0).length;

      expect(distinct).toBeGreaterThan(1);
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

      // Unsuccessful/new should be selected more often (80% vs 20%)
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
      const performance: CharacterPerformance[] = []; // No performance data

      // Should fallback to random when no characters have been attempted
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

    it('should maintain 80/20 split when both groups have characters', () => {
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
      expect(unsuccessfulOrUntestedPercent).toBeGreaterThan(0.75);
      expect(unsuccessfulOrUntestedPercent).toBeLessThan(0.85);
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

describe('getSuccessRateOrNull', () => {
  it('returns null for an untested character so callers must decide what that means', () => {
    expect(getSuccessRateOrNull(null)).toBeNull();
    expect(getSuccessRateOrNull({ characterIndex: 0, correct: 0, total: 0 })).toBeNull();
  });

  it('returns the ratio for an attempted character', () => {
    expect(getSuccessRateOrNull({ characterIndex: 0, correct: 3, total: 4 })).toBe(0.75);
  });
});

describe('getTier', () => {
  it.each([
    ['untested', undefined, 'untested'],
    ['zero attempts', { characterIndex: 0, correct: 0, total: 0 }, 'untested'],
    ['0% success', { characterIndex: 0, correct: 0, total: 3 }, 'struggling'],
    ['just below the threshold', { characterIndex: 0, correct: 4, total: 9 }, 'struggling'],
    ['exactly at the threshold', { characterIndex: 0, correct: 1, total: 2 }, 'mastered'],
    ['100% success', { characterIndex: 0, correct: 5, total: 5 }, 'mastered'],
  ])('classifies %s', (_label, perf, expected) => {
    expect(getTier(perf)).toBe(expected);
  });
});

describe('calculateCharacterWeights', () => {
  const sum = (weights: number[]): number => weights.reduce((a, b) => a + b, 0);

  it('always sums to 1', () => {
    const weights = calculateCharacterWeights(
      [0, 1, 2, 3],
      [
        { characterIndex: 0, correct: 0, total: 2 },
        { characterIndex: 1, correct: 5, total: 5 },
      ]
    );

    expect(sum(weights)).toBeCloseTo(1, 10);
  });

  it('gives each tier its configured share when all three are populated', () => {
    const weights = calculateCharacterWeights(
      [0, 1, 2],
      [
        { characterIndex: 0, correct: 0, total: 2 }, // struggling
        { characterIndex: 2, correct: 5, total: 5 }, // mastered
        // 1 is untested
      ]
    );

    expect(weights[0]).toBeCloseTo(ADAPTIVE_CONFIG.TIER_SHARES.STRUGGLING, 10);
    expect(weights[1]).toBeCloseTo(ADAPTIVE_CONFIG.TIER_SHARES.UNTESTED, 10);
    expect(weights[2]).toBeCloseTo(ADAPTIVE_CONFIG.TIER_SHARES.MASTERED, 10);
  });

  it('ranks a struggling character above an untested one', () => {
    const weights = calculateCharacterWeights(
      [0, 1],
      [{ characterIndex: 0, correct: 0, total: 1 }]
    );

    expect(weights[0] ?? 0).toBeGreaterThan(weights[1] ?? 0);
  });

  it('redistributes an empty tier across the populated ones, in proportion', () => {
    // Only struggling and mastered are populated, so their shares are
    // rescaled by 1 / (0.5 + 0.2).
    const weights = calculateCharacterWeights(
      [0, 1],
      [
        { characterIndex: 0, correct: 0, total: 2 },
        { characterIndex: 1, correct: 5, total: 5 },
      ]
    );
    const scale = ADAPTIVE_CONFIG.TIER_SHARES.STRUGGLING + ADAPTIVE_CONFIG.TIER_SHARES.MASTERED;

    expect(weights[0]).toBeCloseTo(ADAPTIVE_CONFIG.TIER_SHARES.STRUGGLING / scale, 10);
    expect(weights[1]).toBeCloseTo(ADAPTIVE_CONFIG.TIER_SHARES.MASTERED / scale, 10);
  });

  it('ranks a worse character above a better one inside the same tier', () => {
    const weights = calculateCharacterWeights(
      [0, 1],
      [
        { characterIndex: 0, correct: 0, total: 4 }, // 0%
        { characterIndex: 1, correct: 1, total: 4 }, // 25%
      ]
    );

    expect(weights[0] ?? 0).toBeGreaterThan(weights[1] ?? 0);
  });

  it('falls back to uniform weights when every record is corrupt', () => {
    const weights = calculateCharacterWeights([0, 1, 2], [
      { characterIndex: 0, correct: 1, total: Number.NaN },
    ] as CharacterPerformance[]);

    expect(sum(weights)).toBeCloseTo(1, 10);
    weights.forEach((w) => expect(Number.isFinite(w)).toBe(true));
  });

  it('returns an empty array for no characters and [1] for one', () => {
    expect(calculateCharacterWeights([], [])).toEqual([]);
    expect(calculateCharacterWeights([5], [])).toEqual([1.0]);
  });
});
