// Application limits
export const APP_LIMITS = {
  PINYIN_MODE_MAX: 1500,
  SIMPLIFIED_TRADITIONAL_MAX: 539,
  MIN_LIMIT: 50,
  DEFAULT_LIMIT: 500,
} as const;

// Animation timings
export const ANIMATION_TIMINGS = {
  FLASH_RESULT_DURATION: 1000,
  TAB_TRANSITION: 200, // milliseconds
  CARD_HOVER: 150, // milliseconds
} as const;

// UI constants
export const UI_CONSTANTS = {
  INCREMENT_STEP: 50,
  MIN_WIDTH: 100,
} as const;

// Chinese text constants
export const CHINESE_TEXT = {
  APP_TITLE: '汉字 Flashcards',
  APP_SUBTITLE: 'Learn Chinese characters with interactive flashcards',
  MODES: {
    PINYIN: {
      LABEL: '拼音 (F1)',
      TITLE: '拼音模式 - Pinyin Mode (F1)',
      PLACEHOLDER: '输入拼音',
    },
    SIMPLIFIED: {
      LABEL: '简体 (F2)',
      TITLE: '简体模式 - Simplified Mode (F2)',
      PLACEHOLDER: '输入简体字',
    },
    TRADITIONAL: {
      LABEL: '繁体 (F3)',
      TITLE: '繁体模式 - Traditional Mode (F3)',
      PLACEHOLDER: '输入繁体字',
    },
  },
  FEEDBACK: {
    CORRECT: '✓ 正确',
    INCORRECT_PINYIN: (correct: string) => `✗ 错误，正确答案是: ${correct}`,
    INCORRECT_CHARACTER: (correct: string) => `✗ 错误，正确答案是: ${correct}`,
  },
  LABELS: {
    CHARACTER_RANGE: (min: number, max: number) => `Character Range (${min} - ${max})`,
  },
} as const;

// Export layout constants
export * from './layout';
