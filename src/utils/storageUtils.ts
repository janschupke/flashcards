import { Answer, FlashcardMode } from '../types';
import { CharacterPerformance, StoredCounters } from '../types/storage';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { logger } from './logger';

const STORAGE_KEYS = {
  PERFORMANCE: 'flashcard-performance',
  HISTORY: 'flashcard-history',
  COUNTERS: 'flashcard-counters',
  PREVIOUS_ANSWER: 'flashcard-previous-answer',
  ADAPTIVE_RANGE: 'flashcard-adaptive-range',
  MODE: 'flashcard-mode',
} as const;

// Character Performance Functions

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

// Mode Functions
export const saveMode = (mode: FlashcardMode): void => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (error) {
    logger.error('Failed to save mode:', error);
  }
};

export const loadMode = (): FlashcardMode | null => {
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.MODE);
    if (!data) return null;

    // Validate that the stored value is a valid FlashcardMode
    if (Object.values(FlashcardMode).includes(data as FlashcardMode)) {
      return data as FlashcardMode;
    }
    return null;
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
