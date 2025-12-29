import { AppTab } from '../types/layout';
import { ROUTES } from '../constants/routes';

/**
 * Gets the route path for a given app tab
 * @param tab - The app tab
 * @returns The route path for the tab
 */
export const getRouteForTab = (tab: AppTab): string => {
  switch (tab) {
    case AppTab.FLASHCARDS:
      return ROUTES.FLASHCARDS;
    case AppTab.HISTORY:
      return ROUTES.HISTORY;
    case AppTab.STATISTICS:
      return ROUTES.STATISTICS;
    case AppTab.ABOUT:
      return ROUTES.ABOUT;
    default:
      return ROUTES.FLASHCARDS;
  }
};

/**
 * Gets the active tab from a pathname
 * @param pathname - The current pathname
 * @returns The corresponding AppTab
 */
export const getActiveTabFromPath = (pathname: string): AppTab => {
  if (pathname === ROUTES.FLASHCARDS) {
    return AppTab.FLASHCARDS;
  }
  if (pathname === ROUTES.HISTORY) {
    return AppTab.HISTORY;
  }
  if (pathname === ROUTES.STATISTICS) {
    return AppTab.STATISTICS;
  }
  if (pathname === ROUTES.ABOUT) {
    return AppTab.ABOUT;
  }
  return AppTab.FLASHCARDS;
};


