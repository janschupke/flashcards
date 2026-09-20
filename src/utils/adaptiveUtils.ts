import { CharacterPerformance } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

/**
 * Character selection.
 *
 * Characters in range are split into three tiers, each with a fixed share of
 * the draw probability:
 *
 *   STRUGGLING  <50% success, >=1 attempt   0.50
 *   UNTESTED    0 attempts                  0.30
 *   MASTERED    >=50% success               0.20
 *
 * Within STRUGGLING and MASTERED, a character's weight is
 * `(1 - successRate)^2 / (1 + 0.5 * attempts)` -- worse and less-practised
 * ranks higher. UNTESTED is uniform. Each tier's distribution is then blended
 * with a uniform one so a single card cannot monopolise its tier.
 *
 * Shares of empty tiers are redistributed across the tiers that do have
 * members, in proportion to their own shares. With only untested characters
 * left, untested therefore takes 100% of draws -- which is correct, but means
 * the shares are a budget, not a guarantee.
 */

type PerformanceTier = 'struggling' | 'untested' | 'mastered';

/**
 * Success rate of a character that has been attempted, or `null` if it has not.
 *
 * Returning `null` rather than a number forces every caller to decide what an
 * untested character means to it. Selection treats untested as its own tier;
 * the statistics page displays 0%. Previously these two answers (1.0 and 0)
 * lived in two different functions both called "success rate", and a
 * zero-attempt record was counted as "Mastered" on the statistics page.
 */
export const getSuccessRateOrNull = (performance: CharacterPerformance | null): number | null => {
  if (!performance || performance.total === 0) return null;
  return performance.correct / performance.total;
};

/**
 * Success rate for selection maths, where an untested character scores as
 * perfect so it is never mistaken for a struggling one.
 */
export const getSuccessRate = (performance: CharacterPerformance | null): number =>
  getSuccessRateOrNull(performance) ?? 1.0;

export const getTier = (performance: CharacterPerformance | undefined): PerformanceTier => {
  const rate = getSuccessRateOrNull(performance ?? null);
  if (rate === null) return 'untested';
  return rate < ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD ? 'struggling' : 'mastered';
};

/**
 * Raw weight of an attempted character: lower success and fewer attempts rank
 * higher. Guaranteed finite -- a non-finite result would break the cumulative
 * selection loop.
 */
const getAttemptedWeight = (perf: CharacterPerformance): number => {
  const successRate = getSuccessRate(perf);
  const successPenalty = Math.pow(1 - successRate, ADAPTIVE_CONFIG.SUCCESS_PENALTY_EXPONENT);
  const attemptPenalty = 1 / (1 + perf.total * ADAPTIVE_CONFIG.ATTEMPT_PENALTY_FACTOR);
  const weight = successPenalty * attemptPenalty;
  return Number.isFinite(weight) && weight >= 0 ? weight : 0;
};

/**
 * Distributes a tier's share across its members.
 *
 * `TIER_UNIFORM_BLEND` of the share is split evenly and the remainder is
 * distributed by relative weight, so the gap between the worst and the best
 * card in a tier stays bounded.
 */
const distributeTierShare = (
  members: number[],
  share: number,
  rawWeight: (charIndex: number) => number
): Map<number, number> => {
  const result = new Map<number, number>();
  if (members.length === 0 || share <= 0) return result;

  const weights = members.map(rawWeight);
  const total = weights.reduce((a, b) => a + b, 0);

  const uniformPart = share * ADAPTIVE_CONFIG.TIER_UNIFORM_BLEND;
  const weightedPart = share - uniformPart;
  const perMemberUniform = uniformPart / members.length;

  members.forEach((charIndex, i) => {
    const relative = total > 0 ? (weights[i] ?? 0) / total : 1 / members.length;
    result.set(charIndex, perMemberUniform + weightedPart * relative);
  });

  return result;
};

/**
 * Probability of drawing each character, in the order given, summing to 1.
 */
export const calculateCharacterWeights = (
  characters: number[],
  performance: CharacterPerformance[]
): number[] => {
  if (characters.length === 0) return [];
  if (characters.length === 1) return [1.0];

  const performanceMap = new Map<number, CharacterPerformance>();
  performance.forEach((p) => performanceMap.set(p.characterIndex, p));

  const tiers: Record<PerformanceTier, number[]> = {
    struggling: [],
    untested: [],
    mastered: [],
  };
  characters.forEach((charIndex) => {
    tiers[getTier(performanceMap.get(charIndex))].push(charIndex);
  });

  // Redistribute the shares of empty tiers across the populated ones.
  const populated = (Object.keys(tiers) as PerformanceTier[]).filter(
    (tier) => tiers[tier].length > 0
  );
  const shareOf: Record<PerformanceTier, number> = {
    struggling: ADAPTIVE_CONFIG.TIER_SHARES.STRUGGLING,
    untested: ADAPTIVE_CONFIG.TIER_SHARES.UNTESTED,
    mastered: ADAPTIVE_CONFIG.TIER_SHARES.MASTERED,
  };
  const populatedShare = populated.reduce((sum, tier) => sum + shareOf[tier], 0);

  const weights = new Map<number, number>();
  populated.forEach((tier) => {
    const share = shareOf[tier] / populatedShare;
    const distributed = distributeTierShare(tiers[tier], share, (charIndex) => {
      const perf = performanceMap.get(charIndex);
      if (!perf) return 1;
      if (tier === 'mastered') {
        return Math.max(getAttemptedWeight(perf), ADAPTIVE_CONFIG.MIN_SUCCESSFUL_WEIGHT);
      }
      return getAttemptedWeight(perf);
    });
    distributed.forEach((weight, charIndex) => weights.set(charIndex, weight));
  });

  // Final normalisation. Falls back to uniform if anything non-finite slipped
  // through, so a corrupt record can never pin selection to one character.
  const values = characters.map((charIndex) => weights.get(charIndex) ?? 0);
  const total = values.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(total) || total <= 0) {
    return characters.map(() => 1 / characters.length);
  }
  return values.map((weight) => (Number.isFinite(weight) ? weight / total : 0));
};

/**
 * Picks the next character.
 *
 * @param characters - Character indices in the current range
 * @param performance - All stored performance records
 * @param excludeIndex - Character to avoid repeating, ignored when it is the
 *   only candidate. Without this a single failing card could be drawn many
 *   times in a row, since it can legitimately hold most of the probability.
 */
export const selectAdaptiveCharacter = (
  characters: number[],
  performance: CharacterPerformance[],
  excludeIndex?: number
): number => {
  if (characters.length === 0) {
    throw new Error('Cannot select from empty character array');
  }
  if (characters.length === 1) {
    return characters[0] ?? 0;
  }

  const candidates =
    excludeIndex === undefined ? characters : characters.filter((c) => c !== excludeIndex);
  // Everything was excluded: fall back to the full range rather than failing.
  const pool = candidates.length > 0 ? candidates : characters;

  // Adaptive selection activates as soon as any character in the pool has been
  // attempted; before that there is nothing to adapt to.
  const poolSet = new Set(pool);
  const hasEnoughData = performance.some((p) => p.total >= 1 && poolSet.has(p.characterIndex));

  if (!hasEnoughData) {
    return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? 0;
  }

  const weights = calculateCharacterWeights(pool, performance);

  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < pool.length; i++) {
    cumulative += weights[i] ?? 0;
    if (random <= cumulative) {
      return pool[i] ?? 0;
    }
  }

  // Floating-point remainder only.
  return pool[pool.length - 1] ?? 0;
};
