export const ADAPTIVE_CONFIG = {
  // Selection algorithm
  MIN_SELECTION_CHANCE: 0.1,
  MAX_SELECTION_CHANCE: 0.5,
  WEIGHT_MULTIPLIER: 2.0,
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,

  // Priority allocation for different success rate ranges
  // Lower success rates get higher priority allocation
  // These percentages are allocated to each category, shared among characters in that category
  LOW_SUCCESS_PRIORITY: 0.65, // 65% for characters with 0-30% success rate (increased for better focus on struggling characters)
  MEDIUM_SUCCESS_PRIORITY: 0.15, // 15% for characters with 30-70% success rate
  HIGH_SUCCESS_PRIORITY: 0.05, // 5% for characters with 70-100% success rate
  UNTESTED_PRIORITY: 0.15, // 15% for untested characters

  // Success rate thresholds for categorization
  LOW_SUCCESS_THRESHOLD: 0.3, // Below 30% = low success
  MEDIUM_SUCCESS_THRESHOLD: 0.7, // 30-70% = medium, above 70% = high

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
