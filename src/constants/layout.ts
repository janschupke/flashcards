export const COMPONENT_CONSTANTS = {
  CARD_BORDER_RADIUS: 12, // pixels
  INPUT_HEIGHT: {
    SM: 32,
    MD: 40,
    LG: 48,
  },
  BUTTON_MIN_WIDTH: 120, // pixels
  TABLE_ROW_HEIGHT: 48, // pixels
} as const;

export const TAB_CONSTANTS = {
  FLASHCARDS: {
    ID: 'flashcards',
    LABEL: 'Flashcards',
    ARIA_LABEL: 'Flashcards tab',
  },
  HISTORY: {
    ID: 'history',
    LABEL: 'History',
    ARIA_LABEL: 'Answer history tab',
  },
} as const;

export const NAVIGATION_CONSTANTS = {
  LOGO_TEXT: '汉字 Flashcards',
  BRAND_NAME: 'Chinese Flashcards',
} as const;
