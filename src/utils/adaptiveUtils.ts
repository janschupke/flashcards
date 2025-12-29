import { CharacterPerformance } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

/**
 * Calculates the success rate for a character performance.
 *
 * Special cases:
 * - null or 0 total attempts: Returns 1.0 (treated as untested/perfect)
 * - 0 correct, 1 total: Returns 0.0 (0% success rate - worst case, highest priority)
 * - Normal case: correct / total
 *
 * @param performance - Character performance data or null
 * @returns Success rate (0-1), defaults to 1.0 if no attempts
 */
export const getSuccessRate = (performance: CharacterPerformance | null): number => {
  if (!performance || performance.total === 0) {
    return 1.0; // Default to perfect if no attempts
  }
  return performance.correct / performance.total;
};

/**
 * Helper: Categorize characters into groups
 * @internal
 */
const categorizeCharacters = (
  characters: number[],
  performanceMap: Map<number, CharacterPerformance>
): { unsuccessfulOrUntested: number[]; successful: number[] } => {
  const unsuccessfulOrUntested: number[] = [];
  const successful: number[] = [];

  for (const charIndex of characters) {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    const isUnsuccessful = perf && getSuccessRate(perf) < ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD;

    if (isUntested || isUnsuccessful) {
      unsuccessfulOrUntested.push(charIndex);
    } else {
      successful.push(charIndex);
    }
  }

  return { unsuccessfulOrUntested, successful };
};

/**
 * Helper: Calculate base weight for a character
 * @internal
 */
const getCharacterWeight = (
  perf: CharacterPerformance | undefined,
  isUntested: boolean
): number => {
  if (isUntested || !perf) {
    return ADAPTIVE_CONFIG.UNTESTED_WEIGHT;
  }
  const successRate = getSuccessRate(perf);
  return 1 - successRate;
};

/**
 * Helper: Calculate and normalize weights for a group
 * @internal
 */
const calculateGroupWeights = (
  group: number[],
  performanceMap: Map<number, CharacterPerformance>,
  isUntestedGroup: boolean
): Map<number, number> => {
  const weights = new Map<number, number>();

  if (group.length === 0) {
    return weights;
  }

  // Calculate base weights
  const baseWeights = group.map((charIndex) => {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    let weight = getCharacterWeight(perf, isUntested);

    // For successful group, ensure minimum weight
    if (!isUntestedGroup) {
      weight = Math.max(weight, 0.01);
    }

    return weight;
  });

  // Normalize within group
  const sum = baseWeights.reduce((a, b) => a + b, 0);
  const scaleFactor = sum > 0 ? ADAPTIVE_CONFIG.SELECTION_SPLIT / sum : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;

  group.forEach((charIndex, index) => {
    const normalizedWeight = sum > 0 ? baseWeights[index]! * scaleFactor : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;
    weights.set(charIndex, normalizedWeight);
  });

  return weights;
};

/**
 * Helper: Normalize weights to sum to exactly 1.0
 * @internal
 */
const normalizeWeights = (
  weights: Map<number, number>,
  characters: number[]
): number[] => {
  const total = characters.reduce((sum, charIndex) => {
    return sum + (weights.get(charIndex) ?? 0);
  }, 0);

  if (total === 0) {
    // Fallback: equal weights
    const equalWeight = 1.0 / characters.length;
    return characters.map(() => equalWeight);
  }

  // Normalize to sum to exactly 1.0
  return characters.map((charIndex) => {
    return (weights.get(charIndex) ?? 0) / total;
  });
};

/**
 * Calculates selection weights for characters based on their performance.
 *
 * Algorithm:
 * 1. Categorize characters into two groups: unsuccessful/untested vs successful
 * 2. Calculate weights within each group (unsuccessful weighted by inverse success rate, untested get fixed weight)
 * 3. Normalize each group to 50% of total selection probability
 * 4. Final normalization ensures weights sum to exactly 1.0
 *
 * Selection Distribution:
 * - 50% for unsuccessful/untested characters
 * - 50% for successful characters
 *
 * @param characters - Array of character indices in current range
 * @param performance - Array of all character performance data
 * @returns Array of weights (probabilities) for each character, summing to 1.0
 * @internal Used internally by selectAdaptiveCharacter
 */
const calculateCharacterWeights = (
  characters: number[],
  performance: CharacterPerformance[]
): number[] => {
  // Early return for single character
  if (characters.length === 1) {
    return [1.0];
  }

  // Build performance map
  const performanceMap = new Map<number, CharacterPerformance>();
  performance.forEach((p) => performanceMap.set(p.characterIndex, p));

  // Categorize characters
  const { unsuccessfulOrUntested, successful } = categorizeCharacters(characters, performanceMap);

  // Calculate weights for each group
  const weights = new Map<number, number>();
  const unsuccessfulWeights = calculateGroupWeights(unsuccessfulOrUntested, performanceMap, true);
  const successfulWeights = calculateGroupWeights(successful, performanceMap, false);

  // Combine weights
  unsuccessfulWeights.forEach((weight, charIndex) => weights.set(charIndex, weight));
  successfulWeights.forEach((weight, charIndex) => weights.set(charIndex, weight));

  // Normalize to ensure weights sum to exactly 1.0
  return normalizeWeights(weights, characters);
};

/**
 * Selects a character using weighted random selection based on performance.
 *
 * Algorithm:
 * 1. Checks if enough performance data exists (MIN_ATTEMPTS_FOR_ADAPTIVE)
 * 2. If not enough data, falls back to random selection
 * 3. Otherwise, calculates weights using calculateCharacterWeights (normalized to sum to 1.0)
 * 4. Uses weighted random selection to pick a character
 *
 * The algorithm ensures:
 * - 50% of selections come from unsuccessful/untested characters
 * - 50% of selections come from successful characters
 * - Unsuccessful characters get highest priority within their group
 * - Untested characters get increased priority (but lower than unsuccessful)
 *
 * @param characters - Array of character indices in current range
 * @param performance - Array of all character performance data
 * @returns Selected character index
 */
export const selectAdaptiveCharacter = (
  characters: number[],
  performance: CharacterPerformance[]
): number => {
  if (characters.length === 0) {
    throw new Error('Cannot select from empty character array');
  }

  // Early return for single character
  if (characters.length === 1) {
    return characters[0] ?? 0;
  }

  // Check if we have enough performance data
  const hasEnoughData = performance.some(
    (p) =>
      characters.includes(p.characterIndex) &&
      (p.total >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_ADAPTIVE || p.total === 1)
  );

  // Fallback to random if not enough data
  if (!hasEnoughData) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex] ?? characters[0] ?? 0;
  }

  // Calculate weights (normalized to sum to 1.0)
  const weights = calculateCharacterWeights(characters, performance);

  // Select using weighted random
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < characters.length; i++) {
    const weight = weights[i] ?? 0;
    cumulative += weight;
    // For last character, use >= to handle floating point precision
    if (i === characters.length - 1 || random <= cumulative) {
      return characters[i] ?? 0;
    }
  }

  // Fallback to last character (shouldn't happen after normalization)
  return characters[characters.length - 1] ?? 0;
};
