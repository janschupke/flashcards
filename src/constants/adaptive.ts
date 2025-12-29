export const ADAPTIVE_CONFIG = {
  // Success rate threshold for categorization
  UNSUCCESSFUL_THRESHOLD: 0.5, // <50% = unsuccessful (untested also in this group)

  // Weighting constants
  UNTESTED_WEIGHT: 1.0, // Weight for untested characters (highest priority)
  SELECTION_SPLIT: 0.8, // 80% for unsuccessful/untested, 20% for successful
  MIN_SUCCESSFUL_WEIGHT: 0.01, // Minimum weight for successful characters
  // Progressive weighting factors
  ATTEMPT_PENALTY_FACTOR: 0.5, // Factor to reduce weight for characters with many attempts
  SUCCESS_PENALTY_EXPONENT: 2.0, // Exponent for progressive success rate penalty (higher = more aggressive)

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
