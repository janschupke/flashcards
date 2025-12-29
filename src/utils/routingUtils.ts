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
  // Normalize pathname by removing trailing slashes
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  if (normalizedPath === ROUTES.FLASHCARDS) {
    return AppTab.FLASHCARDS;
  }
  if (normalizedPath === ROUTES.HISTORY) {
    return AppTab.HISTORY;
  }
  if (normalizedPath === ROUTES.STATISTICS) {
    return AppTab.STATISTICS;
  }
  if (normalizedPath === ROUTES.ABOUT) {
    return AppTab.ABOUT;
  }
  return AppTab.FLASHCARDS;
};
