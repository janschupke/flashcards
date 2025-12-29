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
    const isUnsuccessful =
      perf !== undefined && getSuccessRate(perf) < ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD;

    if (isUntested || isUnsuccessful) {
      unsuccessfulOrUntested.push(charIndex);
    } else {
      successful.push(charIndex);
    }
  }

  return { unsuccessfulOrUntested, successful };
};

/**
 * Helper: Calculate base weight for a character using progressive weighting
 *
 * Progressive weighting formula:
 * - Untested: Highest priority (UNTESTED_WEIGHT = 1.0)
 * - Unsuccessful: Weight based on inverse success rate, penalized by attempt count
 *   - Lower success rate = exponentially higher weight
 *   - Fewer attempts = higher weight (to prioritize characters that need more practice)
 * - Successful: Lower weight, further reduced by high success rate and many attempts
 *
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
  const totalAttempts = perf.total;

  // Progressive weighting: lower success rate gets exponentially higher weight
  // Use (1 - successRate)^exponent to make low success rates much more important
  const inverseSuccessRate = 1 - successRate;
  const successPenalty = Math.pow(inverseSuccessRate, ADAPTIVE_CONFIG.SUCCESS_PENALTY_EXPONENT);

  // Attempt penalty: characters with many attempts get reduced weight
  // This prevents over-showing characters that have been practiced many times
  // Formula: 1 / (1 + attempts * ATTEMPT_PENALTY_FACTOR) where ATTEMPT_PENALTY_FACTOR = 0.5
  // This means:
  // - 1 attempt: weight ≈ 0.67
  // - 2 attempts: weight ≈ 0.50
  // - 5 attempts: weight ≈ 0.29
  // - 10 attempts: weight ≈ 0.17
  const attemptPenalty = 1 / (1 + totalAttempts * ADAPTIVE_CONFIG.ATTEMPT_PENALTY_FACTOR);

  // Combine: success penalty (higher for low success) * attempt penalty (higher for few attempts)
  // This ensures:
  // - 0% success with 1 attempt gets highest weight
  // - 0% success with 10 attempts gets lower weight (but still high)
  // - 100% success with 1 attempt gets low weight
  // - 100% success with 10 attempts gets very low weight
  return successPenalty * attemptPenalty;
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
      weight = Math.max(weight, ADAPTIVE_CONFIG.MIN_SUCCESSFUL_WEIGHT);
    }

    return weight;
  });

  // Normalize within group
  // Unsuccessful/untested group gets SELECTION_SPLIT (80%), successful gets (1 - SELECTION_SPLIT) (20%)
  const groupSplit = isUntestedGroup
    ? ADAPTIVE_CONFIG.SELECTION_SPLIT
    : 1 - ADAPTIVE_CONFIG.SELECTION_SPLIT;
  const sum = baseWeights.reduce((a, b) => a + b, 0);
  const scaleFactor = sum > 0 ? groupSplit / sum : groupSplit / group.length;

  group.forEach((charIndex, index) => {
    const normalizedWeight =
      sum > 0 ? baseWeights[index]! * scaleFactor : groupSplit / group.length;
    weights.set(charIndex, normalizedWeight);
  });

  return weights;
};

/**
 * Helper: Normalize weights to sum to exactly 1.0
 * @internal
 */
const normalizeWeights = (weights: Map<number, number>, characters: number[]): number[] => {
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
 * 2. Calculate progressive weights within each group:
 *    - Untested: Highest priority (weight = 1.0)
 *    - Unsuccessful: Progressive weight based on (1 - successRate)^2 * attempt_penalty
 *      - Lower success rate = exponentially higher weight
 *      - Fewer attempts = higher weight (prioritizes characters needing more practice)
 *    - Successful: Lower weight, further reduced by high success and many attempts
 * 3. Normalize each group to 80% (unsuccessful/untested) and 20% (successful) of total selection probability
 * 4. Final normalization ensures weights sum to exactly 1.0
 *
 * Selection Distribution:
 * - 80% for unsuccessful/untested characters (prioritizes new and struggling characters)
 * - 20% for successful characters (maintains exposure to mastered characters)
 *
 * Progressive Weighting Benefits:
 * - Characters with 0% success and 1 attempt get highest priority
 * - Characters with 0% success and 10 attempts still get high priority (but lower than 1 attempt)
 * - Characters with 100% success and many attempts get lowest priority
 * - Ensures all characters in range get shown, not just a few successful ones
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
 * 1. Checks if any character has at least 1 attempt (to enable adaptive selection)
 * 2. If no characters have attempts, falls back to random selection
 * 3. Otherwise, calculates weights using calculateCharacterWeights (normalized to sum to 1.0)
 * 4. Uses weighted random selection to pick a character
 *
 * The algorithm ensures:
 * - 80% of selections come from unsuccessful/untested characters
 * - 20% of selections come from successful characters
 * - Progressive weighting: characters with lower success rates and fewer attempts get exponentially higher priority
 * - Untested characters get highest priority (weight = 1.0)
 * - Prevents over-showing successful characters with many attempts
 * - Ensures all characters in range get practice, not just a few
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
  // Activate adaptive selection if any character has at least 1 attempt
  // (This covers early activation and ensures no gap at 2 attempts)
  const hasEnoughData = performance.some(
    (p) => characters.includes(p.characterIndex) && p.total >= 1
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
