export const ADAPTIVE_CONFIG = {
  // Success rate threshold for categorization
  UNSUCCESSFUL_THRESHOLD: 0.5, // <50% = struggling

  /**
   * Share of draws each tier receives.
   *
   * Struggling outranks untested deliberately. Under the previous two-group
   * split both shared one budget, and within it a flat untested weight of 1.0
   * always beat a struggling card's maximum of (1-0)^2/(1+0.5*1) = 0.667 --
   * so the card you had just got wrong was the least likely card in the pool.
   *
   * Struggling + untested still totals 0.8, preserving the original headline
   * split between "needs work" and "mastered". Must sum to 1.
   */
  TIER_SHARES: {
    STRUGGLING: 0.5, // <50% success, at least one attempt
    UNTESTED: 0.3, // never attempted
    MASTERED: 0.2, // >=50% success
  },

  // Weighting constants
  MIN_SUCCESSFUL_WEIGHT: 0.01, // Minimum weight for mastered characters
  // Progressive weighting factors
  ATTEMPT_PENALTY_FACTOR: 0.5, // Factor to reduce weight for characters with many attempts
  SUCCESS_PENALTY_EXPONENT: 2.0, // Exponent for progressive success rate penalty (higher = more aggressive)

  /**
   * Fraction of each tier's share spread uniformly across its members.
   *
   * Without it, a tier containing one badly-failing card hands that card the
   * tier's entire budget, and the same character comes up over and over.
   */
  TIER_UNIFORM_BLEND: 0.15,

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
