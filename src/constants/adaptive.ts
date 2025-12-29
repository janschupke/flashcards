export const ADAPTIVE_CONFIG = {
  // Selection algorithm
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,

  // Success rate threshold for categorization
  UNSUCCESSFUL_THRESHOLD: 0.5, // <50% = unsuccessful (untested also in this group)

  // Weighting constants
  UNTESTED_WEIGHT: 0.8, // Weight for untested characters (lower than max unsuccessful)
  SELECTION_SPLIT: 0.5, // 50% for unsuccessful/untested, 50% for successful

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
