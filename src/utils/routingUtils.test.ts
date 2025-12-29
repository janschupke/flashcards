import { describe, it, expect } from 'vitest';
import { AppTab } from '../types/layout';
import { getRouteForTab, getActiveTabFromPath } from './routingUtils';
import { ROUTES } from '../constants/routes';

describe('routingUtils', () => {
  describe('getRouteForTab', () => {
    it('should return correct route for FLASHCARDS tab', () => {
      expect(getRouteForTab(AppTab.FLASHCARDS)).toBe(ROUTES.FLASHCARDS);
    });

    it('should return correct route for HISTORY tab', () => {
      expect(getRouteForTab(AppTab.HISTORY)).toBe(ROUTES.HISTORY);
    });

    it('should return correct route for STATISTICS tab', () => {
      expect(getRouteForTab(AppTab.STATISTICS)).toBe(ROUTES.STATISTICS);
    });

    it('should return correct route for ABOUT tab', () => {
      expect(getRouteForTab(AppTab.ABOUT)).toBe(ROUTES.ABOUT);
    });

    it('should default to FLASHCARDS for unknown tab', () => {
      // TypeScript prevents this, but testing runtime behavior
      expect(getRouteForTab('UNKNOWN' as AppTab)).toBe(ROUTES.FLASHCARDS);
    });
  });

  describe('getActiveTabFromPath', () => {
    it('should return FLASHCARDS for root path', () => {
      expect(getActiveTabFromPath('/')).toBe(AppTab.FLASHCARDS);
    });

    it('should return HISTORY for /history path', () => {
      expect(getActiveTabFromPath('/history')).toBe(AppTab.HISTORY);
    });

    it('should return STATISTICS for /statistics path', () => {
      expect(getActiveTabFromPath('/statistics')).toBe(AppTab.STATISTICS);
    });

    it('should return ABOUT for /about path', () => {
      expect(getActiveTabFromPath('/about')).toBe(AppTab.ABOUT);
    });

    it('should default to FLASHCARDS for unknown path', () => {
      expect(getActiveTabFromPath('/unknown')).toBe(AppTab.FLASHCARDS);
    });

    it('should handle paths with trailing slashes', () => {
      expect(getActiveTabFromPath('/history/')).toBe(AppTab.HISTORY);
    });
  });
});
