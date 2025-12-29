// Application limits
export const APP_LIMITS = {
  PINYIN_MODE_MAX: 1500,
  MIN_LIMIT: 50,
} as const;

// Animation timings
export const ANIMATION_TIMINGS = {
  FLASH_RESULT_DURATION: 1000,
} as const;

// UI constants
export const UI_CONSTANTS = {
  INCREMENT_STEP: 50,
  MIN_WIDTH: 100,
} as const;

// Chinese text constants
export const CHINESE_TEXT = {
  APP_TITLE: '汉字 Flashcards',
  MODES: {
    PINYIN: {
      LABEL: '拼音 (F1)',
      PLACEHOLDER: '输入拼音',
    },
    SIMPLIFIED: {
      LABEL: '简体 (F2)',
    },
    TRADITIONAL: {
      LABEL: '繁体 (F3)',
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
