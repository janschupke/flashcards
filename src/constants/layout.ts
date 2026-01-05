export const COMPONENT_CONSTANTS = {
  CARD_BORDER_RADIUS: 12, // pixels
  INPUT_HEIGHT: {
    SM: 32,
    MD: 40,
    LG: 48,
  },
  BUTTON_MIN_WIDTH: 110, // pixels
  TABLE_ROW_HEIGHT: 48, // pixels
} as const;

const TAB_CONSTANTS = {
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
  STATISTICS: {
    ID: 'statistics',
    LABEL: 'Statistics',
    ARIA_LABEL: 'Statistics tab',
  },
  ABOUT: {
    ID: 'about',
    LABEL: 'About',
    ARIA_LABEL: 'About tab',
  },
} as const;

import { AppTab } from '../types/layout';

/**
 * Tab configuration type
 */
export type TabConfig = {
  value: AppTab;
  ID: string;
  LABEL: string;
  ARIA_LABEL: string;
};

/**
 * Gets all tabs in a consistent format
 * @returns Array of tab configurations with AppTab enum values
 */
export const getAllTabs = (): TabConfig[] => {
  return [
    { value: AppTab.FLASHCARDS, ...TAB_CONSTANTS.FLASHCARDS },
    { value: AppTab.HISTORY, ...TAB_CONSTANTS.HISTORY },
    { value: AppTab.STATISTICS, ...TAB_CONSTANTS.STATISTICS },
    { value: AppTab.ABOUT, ...TAB_CONSTANTS.ABOUT },
  ];
};

export const NAVIGATION_CONSTANTS = {
  LOGO_TEXT: '汉字 Flashcards',
  BRAND_NAME: 'Chinese Flashcards',
} as const;
