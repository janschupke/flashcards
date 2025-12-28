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
 * Calculates selection weights for characters based on their performance.
 *
 * Priority order (highest to lowest):
 * 1. Low success rate entries (0-30%) - Highest priority
 *    These get LOW_SUCCESS_PRIORITY (50%) allocation, shared equally among all low success entries
 * 2. Untested characters - Share UNTESTED_PRIORITY (20%) equally
 * 3. Medium success rate entries (30-70%) - Share MEDIUM_SUCCESS_PRIORITY (20%), weighted by inverse success rate
 * 4. High success rate entries (70-100%) - Share HIGH_SUCCESS_PRIORITY (10%), weighted by inverse success rate
 *
 * Weight allocation:
 * - Low success (0-30%): 50% total (guaranteed priority allocation)
 * - Untested: 20% total
 * - Medium success (30-70%): 20% total (weighted by 1 - successRate)
 * - High success (70-100%): 10% total (weighted by 1 - successRate)
 * - Weights are normalized and constrained to MIN/MAX_SELECTION_CHANCE
 *
 * Special handling:
 * - Characters with only 1 attempt (even if failed) are considered valid for adaptive selection
 * - Low success entries are not constrained by MAX_SELECTION_CHANCE to ensure prioritization
 *
 * @param characters - Array of character indices in current range
 * @param performance - Array of all character performance data
 * @returns Array of weights (probabilities) for each character
 * @internal Used internally by selectAdaptiveCharacter
 */
const calculateCharacterWeights = (
  characters: number[],
  performance: CharacterPerformance[]
): number[] => {
  // Create a map for quick lookup
  const performanceMap = new Map<number, CharacterPerformance>();
  performance.forEach((p) => performanceMap.set(p.characterIndex, p));

  // Separate characters into categories based on success rate
  const untestedChars: number[] = [];
  const lowSuccessChars: number[] = []; // 0-30% success rate
  const mediumSuccessChars: number[] = []; // 30-70% success rate
  const highSuccessChars: number[] = []; // 70-100% success rate

  characters.forEach((charIndex) => {
    const perf = performanceMap.get(charIndex);
    if (!perf || perf.total === 0) {
      untestedChars.push(charIndex);
    } else {
      const successRate = getSuccessRate(perf);
      if (successRate < ADAPTIVE_CONFIG.LOW_SUCCESS_THRESHOLD) {
        lowSuccessChars.push(charIndex);
      } else if (successRate < ADAPTIVE_CONFIG.MEDIUM_SUCCESS_THRESHOLD) {
        mediumSuccessChars.push(charIndex);
      } else {
        highSuccessChars.push(charIndex);
      }
    }
  });

  // Allocate priority based on success rate categories
  const lowSuccessWeight = lowSuccessChars.length > 0 ? ADAPTIVE_CONFIG.LOW_SUCCESS_PRIORITY : 0;
  const untestedWeight = untestedChars.length > 0 ? ADAPTIVE_CONFIG.UNTESTED_PRIORITY : 0;
  const mediumSuccessWeight =
    mediumSuccessChars.length > 0 ? ADAPTIVE_CONFIG.MEDIUM_SUCCESS_PRIORITY : 0;
  const highSuccessWeight = highSuccessChars.length > 0 ? ADAPTIVE_CONFIG.HIGH_SUCCESS_PRIORITY : 0;

  // Calculate total allocated weight and normalize if needed
  const totalAllocated =
    lowSuccessWeight + untestedWeight + mediumSuccessWeight + highSuccessWeight;
  const normalizationFactor = totalAllocated > 0 ? 1 / totalAllocated : 1;

  // Low success entries get equal share of their priority allocation
  const lowSuccessIndividualWeight =
    lowSuccessChars.length > 0
      ? (lowSuccessWeight * normalizationFactor) / lowSuccessChars.length
      : 0;

  // Untested characters get equal share
  const untestedIndividualWeight =
    untestedChars.length > 0 ? (untestedWeight * normalizationFactor) / untestedChars.length : 0;

  // Calculate weights for medium success characters (inverse of success rate)
  const mediumSuccessWeights = mediumSuccessChars.map((charIndex) => {
    const perf = performanceMap.get(charIndex)!;
    const successRate = getSuccessRate(perf);
    // Lower success rate = higher weight (needs more practice)
    return (1 - successRate) * ADAPTIVE_CONFIG.WEIGHT_MULTIPLIER;
  });

  // Normalize medium success weights to fit in their allocated portion
  const mediumSuccessSum = mediumSuccessWeights.reduce((acc, w) => acc + w, 0);
  const normalizedMediumSuccessWeights =
    mediumSuccessSum > 0
      ? mediumSuccessWeights.map(
          (w) => (w / mediumSuccessSum) * (mediumSuccessWeight * normalizationFactor)
        )
      : mediumSuccessChars.map(
          () => (mediumSuccessWeight * normalizationFactor) / mediumSuccessChars.length
        );

  // Calculate weights for high success characters (inverse of success rate)
  const highSuccessWeights = highSuccessChars.map((charIndex) => {
    const perf = performanceMap.get(charIndex)!;
    const successRate = getSuccessRate(perf);
    // Lower success rate = higher weight (needs more practice)
    return (1 - successRate) * ADAPTIVE_CONFIG.WEIGHT_MULTIPLIER;
  });

  // Normalize high success weights to fit in their allocated portion
  const highSuccessSum = highSuccessWeights.reduce((acc, w) => acc + w, 0);
  const normalizedHighSuccessWeights =
    highSuccessSum > 0
      ? highSuccessWeights.map(
          (w) => (w / highSuccessSum) * (highSuccessWeight * normalizationFactor)
        )
      : highSuccessChars.map(
          () => (highSuccessWeight * normalizationFactor) / highSuccessChars.length
        );

  // Combine weights: each category gets its allocated share
  const weights: number[] = [];
  let mediumSuccessIndex = 0;
  let highSuccessIndex = 0;

  characters.forEach((charIndex) => {
    if (lowSuccessChars.includes(charIndex)) {
      weights.push(lowSuccessIndividualWeight);
    } else if (untestedChars.includes(charIndex)) {
      weights.push(untestedIndividualWeight);
    } else if (mediumSuccessChars.includes(charIndex)) {
      weights.push(normalizedMediumSuccessWeights[mediumSuccessIndex] ?? 0);
      mediumSuccessIndex++;
    } else {
      weights.push(normalizedHighSuccessWeights[highSuccessIndex] ?? 0);
      highSuccessIndex++;
    }
  });

  // Apply min/max constraints
  // Note: Low success entries should not be constrained by MAX since they need highest priority
  const constrainedWeights = weights.map((w, index) => {
    const charIndex = characters[index];
    const isLowSuccess = charIndex !== undefined && lowSuccessChars.includes(charIndex);

    if (w < ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE) {
      return ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE;
    }
    // Don't cap low success entries at MAX - they need to be prioritized
    if (!isLowSuccess && w > ADAPTIVE_CONFIG.MAX_SELECTION_CHANCE) {
      return ADAPTIVE_CONFIG.MAX_SELECTION_CHANCE;
    }
    return w;
  });

  // Renormalize after applying constraints
  const constrainedSum = constrainedWeights.reduce((acc, w) => acc + w, 0);
  if (constrainedSum > 0) {
    return constrainedWeights.map((w) => w / constrainedSum);
  }

  // Fallback to equal weights
  return characters.map(() => 1 / characters.length);
};

/**
 * Selects a character using weighted random selection based on performance.
 *
 * Algorithm:
 * 1. Checks if enough performance data exists (MIN_ATTEMPTS_FOR_ADAPTIVE)
 * 2. If not enough data, falls back to random selection
 * 3. Otherwise, calculates weights using calculateCharacterWeights
 * 4. Uses weighted random selection to pick a character
 *
 * The algorithm prioritizes:
 * - Low success rate entries (0-30%) - Highest priority (50% allocation)
 * - Untested characters - Medium-high priority (20% allocation)
 * - Medium success rate entries (30-70%) - Medium priority (20% allocation, weighted)
 * - High success rate entries (70-100%) - Lower priority (10% allocation, weighted)
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

  // Check if we have enough performance data to use adaptive selection
  // We need at least one character with performance data in the current range
  // Special case: Characters with only 1 attempt are considered valid data
  // even if they don't meet MIN_ATTEMPTS_FOR_ADAPTIVE threshold
  const hasEnoughData = performance.some(
    (p) =>
      characters.includes(p.characterIndex) &&
      (p.total >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_ADAPTIVE || p.total === 1) // Single attempts are always valid for adaptive selection
  );

  // Fallback to random if not enough data
  if (!hasEnoughData) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const selected = characters[randomIndex];
    if (selected === undefined) {
      return characters[0] ?? 0;
    }
    return selected;
  }

  // Calculate weights
  const weights = calculateCharacterWeights(characters, performance);

  // Select using weighted random
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < characters.length; i++) {
    const weight = weights[i];
    if (weight === undefined) continue;
    cumulative += weight;
    if (random <= cumulative) {
      const selected = characters[i];
      if (selected !== undefined) {
        return selected;
      }
    }
  }

  // Fallback to last character (shouldn't happen, but safety)
  const lastChar = characters[characters.length - 1];
  return lastChar ?? 0;
};
