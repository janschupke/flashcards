import { AppTab } from '../types/layout';

export const COMPONENT_CONSTANTS = {
  BUTTON_MIN_WIDTH: 110, // pixels
} as const;

const TAB_CONSTANTS = {
  FLASHCARDS: {
    ID: 'flashcards',
    LABEL: 'Flashcards',
  },
  HISTORY: {
    ID: 'history',
    LABEL: 'History',
  },
  STATISTICS: {
    ID: 'statistics',
    LABEL: 'Statistics',
  },
  ABOUT: {
    ID: 'about',
    LABEL: 'About',
  },
} as const;

/**
 * Tab configuration type
 */
type TabConfig = {
  value: AppTab;
  ID: string;
  LABEL: string;
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
