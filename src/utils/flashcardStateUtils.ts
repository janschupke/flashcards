import { FlashCardState, Answer, Character, FlashResult, HINT_TYPES } from '../types';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { evaluatePinyinAnswer, createAnswer } from './flashcardUtils';
import {
  saveCounters,
  saveHistory,
  savePreviousAnswer,
  saveAdaptiveRange,
  saveRecentAnswers,
  updateCharacterPerformance,
  getAllCharacterPerformance,
} from './storageUtils';
import { selectAdaptiveCharacter } from './adaptiveUtils';
import data from '../data/characters.json';

/**
 * Trims an array to keep only the last N items
 * @param array - Array to trim
 * @param maxLength - Maximum length to keep
 * @returns Trimmed array
 */
const trimToLimit = <T>(array: T[], maxLength: number): T[] => {
  if (array.length <= maxLength) {
    return array;
  }
  return array.slice(-maxLength);
};

/**
 * Processes an answer and returns the answer object and evaluation result
 */
export const processAnswer = (
  character: Character,
  pinyinInput: string,
  characterIndex: number
): { answer: Answer; isCorrect: boolean; hasInput: boolean } => {
  const evaluation = evaluatePinyinAnswer(pinyinInput, character);
  const { isCorrect, hasInput } = evaluation;
  const answer = createAnswer(character, pinyinInput, characterIndex, isCorrect);
  return { answer, isCorrect, hasInput };
};

/**
 * Updates all storage after processing an answer
 */
export const updateStorageAfterAnswer = (
  characterIndex: number,
  isCorrect: boolean,
  correctAnswers: number,
  totalAttempted: number,
  totalSeen: number,
  allAnswers: Answer[],
  answer: Answer,
  recentAnswers: Answer[],
  adaptiveRange: number,
  previousAdaptiveRange: number
): void => {
  // Always update performance - empty answers are incorrect attempts
  updateCharacterPerformance(characterIndex, isCorrect);

  saveCounters({
    correctAnswers,
    totalSeen,
    totalAttempted,
  });

  // Save history to storage (trimmed to MAX_HISTORY_ENTRIES)
  saveHistory(allAnswers);
  savePreviousAnswer(answer);

  // Persisted so expansion progress survives a reload. Previously the window
  // was state-only, so every refresh needed ten fresh answers again.
  saveRecentAnswers(recentAnswers);

  // Only write the range when it actually moved.
  if (adaptiveRange !== previousAdaptiveRange) {
    saveAdaptiveRange(adaptiveRange);
  }
};

/**
 * Calculates adaptive range expansion based on recent performance (rolling window)
 * @param recentAnswers - Last 10 answers for expansion calculation
 * @param currentAdaptiveRange - Current adaptive range
 * @returns Object with newAdaptiveRange and shouldExpand flag
 */
export const calculateAdaptiveRangeExpansion = (
  recentAnswers: Answer[],
  currentAdaptiveRange: number
): { newAdaptiveRange: number; shouldExpand: boolean } => {
  // Pure: the caller persists the result. Writing here meant this ran inside a
  // setState updater on every single answer, even when nothing changed.
  if (recentAnswers.length < ADAPTIVE_CONFIG.EXPANSION_INTERVAL) {
    return { newAdaptiveRange: currentAdaptiveRange, shouldExpand: false };
  }

  const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length;
  const successRate = recentCorrect / recentAnswers.length;

  if (successRate < ADAPTIVE_CONFIG.SUCCESS_THRESHOLD) {
    return { newAdaptiveRange: currentAdaptiveRange, shouldExpand: false };
  }

  const expanded = Math.min(currentAdaptiveRange + ADAPTIVE_CONFIG.EXPANSION_AMOUNT, data.length);

  // Already at the full dataset: nothing to expand into.
  if (expanded === currentAdaptiveRange) {
    return { newAdaptiveRange: currentAdaptiveRange, shouldExpand: false };
  }

  return { newAdaptiveRange: expanded, shouldExpand: true };
};

/**
 * Gets the next character index using adaptive selection
 *
 * @param adaptiveRange - Current practice range
 * @param excludeIndex - Character to avoid repeating immediately
 */
export const getNextCharacterIndex = (adaptiveRange: number, excludeIndex?: number): number => {
  const effectiveLimit = Math.min(adaptiveRange, data.length);
  const charactersInRange = Array.from({ length: effectiveLimit }, (_, i) => i);
  const performance = getAllCharacterPerformance();
  return selectAdaptiveCharacter(charactersInRange, performance, excludeIndex);
};

/**
 * Creates the updated state after processing an answer
 */
export const createNextState = (
  prevState: FlashCardState,
  answer: Answer,
  isCorrect: boolean,
  hasInput: boolean,
  newCorrectAnswers: number,
  newTotalAttempted: number,
  newTotalSeen: number,
  newIncorrectAnswers: Answer[],
  newAllAnswers: Answer[],
  newAdaptiveRange: number,
  newRecentAnswers: Answer[],
  newIndex: number
): FlashCardState => {
  // Trim history to MAX_HISTORY_ENTRIES to keep state in sync with storage
  const trimmedAllAnswers = trimToLimit(newAllAnswers, ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
  // Also trim incorrectAnswers to match (keep only incorrect answers from trimmed history)
  const trimmedIncorrectAnswers = trimToLimit(
    newIncorrectAnswers,
    ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
  );

  return {
    ...prevState,
    previousCharacter: prevState.current,
    previousAnswer: answer,
    current: newIndex,
    limit: Math.min(newAdaptiveRange, data.length),
    hint: HINT_TYPES.NONE,
    totalSeen: newTotalSeen,
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: newCorrectAnswers,
    totalAttempted: newTotalAttempted,
    flashResult: hasInput ? (isCorrect ? FlashResult.CORRECT : FlashResult.INCORRECT) : null,
    incorrectAnswers: trimmedIncorrectAnswers,
    allAnswers: trimmedAllAnswers,
    adaptiveRange: newAdaptiveRange,
    recentAnswers: newRecentAnswers,
  };
};
