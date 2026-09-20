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
  RECENT_ANSWERS: 'flashcard-recent-answers',
  MODE: 'flashcard-mode',
  SCHEMA_VERSION: 'flashcard-schema-version',
} as const;

/**
 * Current shape of everything under STORAGE_KEYS.
 *
 * There was no version marker before, so an absent version means "the shape
 * this app has always written". Every slot validates on read regardless, so a
 * missing or unknown version is not fatal: records that fail validation are
 * dropped and the version is re-stamped.
 */
const SCHEMA_VERSION = 1;

/**
 * A single validated localStorage slot.
 *
 * Every read runs through `parse`, which must return `null` for anything it
 * does not recognise. That is the single place bad data is stopped -- before
 * it can reach the weighting maths, where a NaN silently pins selection to one
 * character forever.
 */
interface StorageSlot<T> {
  load: () => T | null;
  save: (value: T) => void;
  clear: () => void;
}

const createStorageSlot = <T>(key: string, parse: (raw: unknown) => T | null): StorageSlot<T> => ({
  load: () => {
    try {
      const data = window.localStorage.getItem(key);
      if (data === null) return null;
      return parse(JSON.parse(data));
    } catch {
      return null;
    }
  },
  save: (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Failed to save ${key}:`, error);
    }
  },
  clear: () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to clear ${key}:`, error);
    }
  },
});

// Validators

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

/**
 * A performance record is only usable if both counters are real, non-negative
 * numbers and `correct` cannot exceed `total`. A record missing `total`
 * produced NaN weights, which made the selection loop fall through to the last
 * character in range on every single draw.
 */
const parsePerformanceRecord = (value: unknown): CharacterPerformance | null => {
  if (!isObject(value)) return null;
  const { characterIndex, correct, total, lastSeen } = value;

  if (!isCount(characterIndex) || !isCount(correct) || !isCount(total)) return null;
  if (correct > total) return null;

  return {
    characterIndex,
    correct,
    total,
    ...(isCount(lastSeen) ? { lastSeen } : {}),
  };
};

const parseAnswer = (value: unknown): Answer | null => {
  if (!isObject(value)) return null;
  const { characterIndex, submittedPinyin, correctPinyin, simplified, traditional, english } =
    value;

  if (!isCount(characterIndex)) return null;
  if (typeof value['isCorrect'] !== 'boolean') return null;
  if (
    [submittedPinyin, correctPinyin, simplified, traditional, english].some(
      (field) => typeof field !== 'string'
    )
  ) {
    return null;
  }

  return value as unknown as Answer;
};

/** Drops individual records that fail validation rather than the whole array. */
const parseAnswerArray = (value: unknown): Answer[] | null => {
  if (!Array.isArray(value)) return null;
  return value.map(parseAnswer).filter((a): a is Answer => a !== null);
};

const parseCounters = (value: unknown): StoredCounters | null => {
  if (!isObject(value)) return null;
  const { correctAnswers, totalSeen, totalAttempted, lastUpdated } = value;
  if (!isCount(correctAnswers) || !isCount(totalSeen) || !isCount(totalAttempted)) return null;

  return {
    correctAnswers,
    totalSeen,
    totalAttempted,
    lastUpdated: isCount(lastUpdated) ? lastUpdated : 0,
  };
};

const parseAdaptiveRange = (value: unknown): number | null => {
  if (!isCount(value) || value < 1) return null;
  return Math.floor(value);
};

const parseMode = (value: unknown): FlashcardMode | null =>
  typeof value === 'string' && Object.values(FlashcardMode).includes(value as FlashcardMode)
    ? (value as FlashcardMode)
    : null;

// Slots

const performanceSlot = createStorageSlot<CharacterPerformance[]>(
  STORAGE_KEYS.PERFORMANCE,
  (value) => {
    // Array.isArray matters: a non-array here used to throw from inside a
    // setState updater, with no ErrorBoundary above it.
    if (!Array.isArray(value)) return null;
    return value.map(parsePerformanceRecord).filter((p): p is CharacterPerformance => p !== null);
  }
);

const historySlot = createStorageSlot<Answer[]>(STORAGE_KEYS.HISTORY, parseAnswerArray);
const recentAnswersSlot = createStorageSlot<Answer[]>(
  STORAGE_KEYS.RECENT_ANSWERS,
  parseAnswerArray
);
const countersSlot = createStorageSlot<StoredCounters>(STORAGE_KEYS.COUNTERS, parseCounters);
const previousAnswerSlot = createStorageSlot<Answer>(STORAGE_KEYS.PREVIOUS_ANSWER, parseAnswer);
const adaptiveRangeSlot = createStorageSlot<number>(
  STORAGE_KEYS.ADAPTIVE_RANGE,
  parseAdaptiveRange
);
const versionSlot = createStorageSlot<number>(STORAGE_KEYS.SCHEMA_VERSION, (value) =>
  isCount(value) ? value : null
);

// Mode is stored as a bare string rather than JSON, so it does not use a slot.
export const saveMode = (mode: FlashcardMode): void => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (error) {
    logger.error('Failed to save mode:', error);
  }
};

export const loadMode = (): FlashcardMode | null => {
  try {
    return parseMode(window.localStorage.getItem(STORAGE_KEYS.MODE));
  } catch {
    return null;
  }
};

// Character performance

export const getAllCharacterPerformance = (): CharacterPerformance[] =>
  performanceSlot.load() ?? [];

export const updateCharacterPerformance = (characterIndex: number, isCorrect: boolean): void => {
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

  performanceSlot.save(performance);
};

// History

export const saveHistory = (answers: Answer[]): void => {
  historySlot.save(answers.slice(-ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES));
};

export const loadHistory = (): Answer[] => historySlot.load() ?? [];

// Recent answers (the rolling window that drives range expansion)

export const saveRecentAnswers = (answers: Answer[]): void => {
  recentAnswersSlot.save(answers.slice(-ADAPTIVE_CONFIG.EXPANSION_INTERVAL));
};

export const loadRecentAnswers = (): Answer[] =>
  (recentAnswersSlot.load() ?? []).slice(-ADAPTIVE_CONFIG.EXPANSION_INTERVAL);

// Counters

export const saveCounters = (counters: Omit<StoredCounters, 'lastUpdated'>): void => {
  countersSlot.save({ ...counters, lastUpdated: Date.now() });
};

export const loadCounters = (): StoredCounters | null => countersSlot.load();

// Previous answer

export const savePreviousAnswer = (answer: Answer | null): void => {
  if (answer === null) {
    previousAnswerSlot.clear();
  } else {
    previousAnswerSlot.save(answer);
  }
};

export const loadPreviousAnswer = (): Answer | null => previousAnswerSlot.load();

// Adaptive range

export const saveAdaptiveRange = (range: number): void => {
  adaptiveRangeSlot.save(range);
};

export const loadAdaptiveRange = (): number | null => adaptiveRangeSlot.load();

/**
 * Validates everything in storage once at startup and stamps the schema
 * version. Rewrites each slot from its validated value so a record that fails
 * validation is dropped from disk, not just from this session.
 */
export const migrateStorage = (): void => {
  if (versionSlot.load() === SCHEMA_VERSION) return;

  const performance = performanceSlot.load();
  if (performance !== null) performanceSlot.save(performance);

  const history = historySlot.load();
  if (history !== null) historySlot.save(history);

  const recent = recentAnswersSlot.load();
  if (recent !== null) recentAnswersSlot.save(recent);

  const counters = countersSlot.load();
  if (counters !== null) countersSlot.save(counters);

  const previous = previousAnswerSlot.load();
  if (previous !== null) previousAnswerSlot.save(previous);

  const range = adaptiveRangeSlot.load();
  if (range !== null) adaptiveRangeSlot.save(range);

  versionSlot.save(SCHEMA_VERSION);
};

export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    logger.error('Failed to clear all storage:', error);
  }
};
