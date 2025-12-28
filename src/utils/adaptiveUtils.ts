import { CharacterPerformance } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

/**
 * Calculates the success rate for a character performance
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
 * Calculates selection weights for characters based on their performance
 * @param characters - Array of character indices in current range
 * @param performance - Array of all character performance data
 * @returns Array of weights (probabilities) for each character
 */
export const calculateCharacterWeights = (
  characters: number[],
  performance: CharacterPerformance[]
): number[] => {
  // Create a map for quick lookup
  const performanceMap = new Map<number, CharacterPerformance>();
  performance.forEach((p) => performanceMap.set(p.characterIndex, p));

  // Separate tested and untested characters
  const untestedChars: number[] = [];
  const testedChars: number[] = [];

  characters.forEach((charIndex) => {
    const perf = performanceMap.get(charIndex);
    if (!perf || perf.total === 0) {
      untestedChars.push(charIndex);
    } else {
      testedChars.push(charIndex);
    }
  });

  // Calculate weights for tested characters (inverse of success rate)
  const testedWeights = testedChars.map((charIndex) => {
    const perf = performanceMap.get(charIndex)!;
    const successRate = getSuccessRate(perf);
    // Lower success rate = higher weight (needs more practice)
    return 1 - successRate;
  });

  // Apply weight multiplier to tested characters
  const multipliedTestedWeights = testedWeights.map((w) => w * ADAPTIVE_CONFIG.WEIGHT_MULTIPLIER);

  // Allocate priority to untested characters
  const untestedWeight = untestedChars.length > 0 ? ADAPTIVE_CONFIG.UNTESTED_PRIORITY : 0;
  const testedWeight = 1 - untestedWeight;

  // Normalize tested weights to fit in their allocated portion
  const testedSum = multipliedTestedWeights.reduce((acc, w) => acc + w, 0);
  const normalizedTestedWeights =
    testedSum > 0
      ? multipliedTestedWeights.map((w) => (w / testedSum) * testedWeight)
      : testedChars.map(() => testedWeight / testedChars.length);

  // Combine weights: untested get equal share of their priority, tested get normalized weights
  const weights: number[] = [];
  const untestedIndividualWeight =
    untestedChars.length > 0 ? untestedWeight / untestedChars.length : 0;

  let testedIndex = 0;
  characters.forEach((charIndex) => {
    if (untestedChars.includes(charIndex)) {
      weights.push(untestedIndividualWeight);
    } else {
      weights.push(normalizedTestedWeights[testedIndex] ?? 0);
      testedIndex++;
    }
  });

  // Apply min/max constraints
  const constrainedWeights = weights.map((w) => {
    if (w < ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE) {
      return ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE;
    }
    if (w > ADAPTIVE_CONFIG.MAX_SELECTION_CHANCE) {
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
 * Selects a character using weighted random selection based on performance
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
  const hasEnoughData = performance.some(
    (p) =>
      characters.includes(p.characterIndex) && p.total >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_ADAPTIVE
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
