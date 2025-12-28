export const ADAPTIVE_CONFIG = {
  // Selection algorithm
  MIN_SELECTION_CHANCE: 0.1,
  MAX_SELECTION_CHANCE: 0.5,
  WEIGHT_MULTIPLIER: 2.0,
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,
  // Priority for untested characters (percentage of selection probability)
  UNTESTED_PRIORITY: 0.4, // 40% chance for untested characters in active set

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
