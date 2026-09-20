// Animation timings
export const ANIMATION_TIMINGS = {
  FLASH_RESULT_DURATION: 1000,
  TOAST_DURATION: 3000,
  PAGE_TRANSITION_DELAY: 20,
} as const;

// UI constants
export const UI_CONSTANTS = {
  MIN_WIDTH: 100,
} as const;

// Success rate thresholds. Anything below LEARNING is "struggling".
export const SUCCESS_RATE_THRESHOLDS = {
  MASTERED: 0.8, // ≥80% = mastered (green)
  LEARNING: 0.5, // 50-79% = learning (yellow), <50% = struggling (red)
} as const;

// Table constants
export const TABLE_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50, 100] as const,
} as const;

// Chinese text constants
export const CHINESE_TEXT = {
  APP_TITLE: '汉字 Flashcards',
  MODES: {
    PINYIN: {
      PLACEHOLDER: '输入拼音',
    },
  },
  FEEDBACK: {
    CORRECT: '✓ 正确',
    INCORRECT_PINYIN: (correct: string) => `✗ 错误，正确答案是: ${correct}`,
  },
  LABELS: {
    CHARACTER_RANGE: (min: number, max: number) => `Character Range (${min} - ${max})`,
  },
} as const;

// Export layout constants
export * from './layout';
// Export route constants
export * from './routes';
