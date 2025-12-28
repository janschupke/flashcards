import { Answer } from '../types';
import { CharacterPerformance, StoredCounters, StorageData } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { logger } from './logger';

const STORAGE_KEYS = {
  PERFORMANCE: 'flashcard-performance',
  HISTORY: 'flashcard-history',
  COUNTERS: 'flashcard-counters',
  PREVIOUS_ANSWER: 'flashcard-previous-answer',
  ADAPTIVE_RANGE: 'flashcard-adaptive-range',
} as const;

// Character Performance Functions
export const getCharacterPerformance = (characterIndex: number): CharacterPerformance | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
    if (!data) return null;

    const performance = JSON.parse(data) as CharacterPerformance[];
    return performance.find((p) => p.characterIndex === characterIndex) ?? null;
  } catch {
    return null;
  }
};

export const getAllCharacterPerformance = (): CharacterPerformance[] => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
    if (!data) return [];

    return JSON.parse(data) as CharacterPerformance[];
  } catch {
    return [];
  }
};

export const updateCharacterPerformance = (characterIndex: number, isCorrect: boolean): void => {
  try {
    const performance = getAllCharacterPerformance();
    const existing = performance.find((p) => p.characterIndex === characterIndex);

    if (existing) {
      existing.correct += isCorrect ? 1 : 0;
      existing.total += 1;
      existing.lastSeen = Date.now();
    } else {
      performance.push({
        characterIndex,
        correct: isCorrect ? 1 : 0,
        total: 1,
        lastSeen: Date.now(),
      });
    }

    window.localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(performance));
  } catch (error) {
    logger.error('Failed to update character performance:', error);
  }
};

export const clearCharacterPerformance = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PERFORMANCE);
  } catch (error) {
    logger.error('Failed to clear character performance:', error);
  }
};

// History Functions
export const saveHistory = (answers: Answer[]): void => {
  try {
    const limited = answers.slice(-ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
    window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limited));
  } catch (error) {
    logger.error('Failed to save history:', error);
  }
};

export const loadHistory = (): Answer[] => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!data) return [];

    return JSON.parse(data) as Answer[];
  } catch {
    return [];
  }
};

// Counters Functions
export const saveCounters = (counters: Omit<StoredCounters, 'lastUpdated'>): void => {
  try {
    const stored: StoredCounters = {
      ...counters,
      lastUpdated: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(stored));
  } catch (error) {
    logger.error('Failed to save counters:', error);
  }
};

export const loadCounters = (): StoredCounters | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.COUNTERS);
    if (!data) return null;

    return JSON.parse(data) as StoredCounters;
  } catch {
    return null;
  }
};

// Previous Answer Functions
export const savePreviousAnswer = (answer: Answer | null): void => {
  try {
    if (answer === null) {
      window.localStorage.removeItem(STORAGE_KEYS.PREVIOUS_ANSWER);
    } else {
      window.localStorage.setItem(STORAGE_KEYS.PREVIOUS_ANSWER, JSON.stringify(answer));
    }
  } catch (error) {
    logger.error('Failed to save previous answer:', error);
  }
};

export const loadPreviousAnswer = (): Answer | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.PREVIOUS_ANSWER);
    if (!data) return null;

    return JSON.parse(data) as Answer;
  } catch {
    return null;
  }
};

// Adaptive Range Functions
export const saveAdaptiveRange = (range: number): void => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.ADAPTIVE_RANGE, JSON.stringify(range));
  } catch (error) {
    logger.error('Failed to save adaptive range:', error);
  }
};

export const loadAdaptiveRange = (): number | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.ADAPTIVE_RANGE);
    if (!data) return null;

    return JSON.parse(data) as number;
  } catch {
    return null;
  }
};

// Clear All Storage
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    logger.error('Failed to clear all storage:', error);
  }
};

// Storage Data Functions (for compatibility)
export const getStorageData = (): StorageData => {
  return {
    characterPerformance: getAllCharacterPerformance(),
  };
};

export const saveStorageData = (data: StorageData): void => {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.PERFORMANCE,
      JSON.stringify(data.characterPerformance)
    );
  } catch (error) {
    logger.error('Failed to save storage data:', error);
  }
};
