import { FlashCardState, Answer, Character, FlashResult, HINT_TYPES } from '../types';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { evaluatePinyinAnswer, createAnswer } from './flashcardUtils';
import {
  saveCounters,
  saveHistory,
  savePreviousAnswer,
  saveAdaptiveRange,
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
  answer: Answer
): void => {
  // Note: allAnswers parameter is used for saving history
  // Always update performance - empty answers are incorrect attempts
  updateCharacterPerformance(characterIndex, isCorrect);

  // Save counters to storage
  saveCounters({
    correctAnswers,
    totalSeen,
    totalAttempted,
  });

  // Save history to storage (trimmed to MAX_HISTORY_ENTRIES)
  saveHistory(allAnswers);

  // Save previous answer to storage
  savePreviousAnswer(answer);
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
  let newAdaptiveRange = currentAdaptiveRange;
  let shouldExpand = false;

  // Only check expansion if we have enough recent answers
  if (recentAnswers.length >= ADAPTIVE_CONFIG.EXPANSION_INTERVAL) {
    // Calculate success rate from last 10 answers
    const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length;
    const recentTotal = recentAnswers.length;
    const successRate = recentCorrect / recentTotal;

    if (successRate >= ADAPTIVE_CONFIG.SUCCESS_THRESHOLD) {
      // Expand range
      const maxRange = Math.min(
        currentAdaptiveRange + ADAPTIVE_CONFIG.EXPANSION_AMOUNT,
        data.length
      );
      newAdaptiveRange = maxRange;
      shouldExpand = true;
    }
  }

  // Save adaptive range to storage
  saveAdaptiveRange(newAdaptiveRange);

  return {
    newAdaptiveRange,
    shouldExpand,
  };
};

/**
 * Gets the next character index using adaptive selection
 */
export const getNextCharacterIndex = (adaptiveRange: number): number => {
  const effectiveLimit = Math.min(adaptiveRange, data.length);
  const charactersInRange = Array.from({ length: effectiveLimit }, (_, i) => i);
  const performance = getAllCharacterPerformance();
  return selectAdaptiveCharacter(charactersInRange, performance);
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
