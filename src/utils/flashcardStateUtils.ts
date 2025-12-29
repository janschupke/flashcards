import {
  FlashCardState,
  Answer,
  Character,
  FlashResult,
  HINT_TYPES,
} from '../types';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

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
  hasInput: boolean,
  correctAnswers: number,
  totalAttempted: number,
  totalSeen: number,
  allAnswers: Answer[],
  answer: Answer
): void => {
  // Note: allAnswers parameter is used for saving history
  // Update character performance in storage
  if (hasInput) {
    updateCharacterPerformance(characterIndex, isCorrect);
  }

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
 * Calculates adaptive range expansion based on performance
 * @returns Object with newAdaptiveRange and shouldExpand flag
 */
export const calculateAdaptiveRangeExpansion = (
  answersSinceLastCheck: number,
  totalAttempted: number,
  correctAnswers: number,
  currentAdaptiveRange: number
): { newAdaptiveRange: number; shouldExpand: boolean; newAnswersSinceLastCheck: number } => {
  const newAnswersSinceLastCheck = answersSinceLastCheck + 1;
  let newAdaptiveRange = currentAdaptiveRange;
  let shouldExpand = false;

  // Check if we should expand the range
  if (
    newAnswersSinceLastCheck >= ADAPTIVE_CONFIG.EXPANSION_INTERVAL &&
    totalAttempted >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_EXPANSION
  ) {
    // Calculate success rate for current range
    const successRate = totalAttempted > 0 ? correctAnswers / totalAttempted : 0;

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
    newAnswersSinceLastCheck: shouldExpand ? 0 : newAnswersSinceLastCheck,
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
  newAnswersSinceLastCheck: number,
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
    answersSinceLastCheck: newAnswersSinceLastCheck,
  };
};

