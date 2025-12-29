import { useState, useEffect, useCallback } from 'react';
import {
  FlashCardState,
  FlashCardActions,
  HintType,
  HINT_TYPES,
  FlashcardMode,
  FlashResult,
  Character,
} from '../types';
import { getRandomCharacterIndex } from '../utils/characterUtils';
import {
  loadHistory,
  loadCounters,
  loadPreviousAnswer,
  loadAdaptiveRange,
  loadMode,
  saveMode,
  saveAdaptiveRange,
} from '../utils/storageUtils';
import { evaluatePinyinAnswer } from '../utils/flashcardUtils';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { ANIMATION_TIMINGS } from '../constants';
import {
  processAnswer,
  updateStorageAfterAnswer,
  calculateAdaptiveRangeExpansion,
  getNextCharacterIndex,
  createNextState,
} from '../utils/flashcardStateUtils';
import data from '../data/characters.json';

interface UseFlashCardProps {
  initialCurrent?: number;
}

export const useFlashCard = ({ initialCurrent }: UseFlashCardProps = {}): FlashCardState &
  FlashCardActions => {
  // Load data from storage on initialization
  const storedHistory = loadHistory();
  const storedCounters = loadCounters();
  const storedPreviousAnswer = loadPreviousAnswer();
  const storedAdaptiveRange = loadAdaptiveRange();
  const storedMode = loadMode();

  // Trim history if it exceeds limit (defensive check in case of data migration or manual edits)
  const trimmedHistory =
    storedHistory.length > ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
      ? storedHistory.slice(-ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES)
      : storedHistory;

  const initialAdaptiveRange = storedAdaptiveRange ?? ADAPTIVE_CONFIG.INITIAL_RANGE;
  const effectiveLimit = Math.min(initialAdaptiveRange, data.length);

  // Initialize current index - use useState initializer to avoid Math.random in render
  const [initialCurrentIndex] = useState<number>(() => {
    return initialCurrent ?? Math.floor(Math.random() * effectiveLimit);
  });

  const [state, setState] = useState<FlashCardState>({
    current: initialCurrentIndex,
    limit: effectiveLimit,
    hint: HINT_TYPES.NONE,
    totalSeen: storedCounters?.totalSeen ?? 0,
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: storedCounters?.correctAnswers ?? 0,
    totalAttempted: storedCounters?.totalAttempted ?? 0,
    flashResult: null,
    // Previous character tracking
    previousCharacter: null,
    // Previous answer tracking
    previousAnswer: storedPreviousAnswer ?? null,
    // Incorrect answers tracking
    incorrectAnswers: [],
    // All answers tracking (trimmed to MAX_HISTORY_ENTRIES)
    allAnswers: trimmedHistory,
    // Display mode - controls what characters are shown (load from storage or default to BOTH)
    mode: storedMode ?? FlashcardMode.BOTH,
    // Adaptive learning fields
    adaptiveRange: initialAdaptiveRange,
    answersSinceLastCheck: 0,
  });

  // Get current character - always return full character (mode only affects display)
  const currentIndex = state.current;
  const getCurrentCharacter = useCallback((): Character | null => {
    return data[currentIndex] ?? null;
  }, [currentIndex]);

  const getNext = useCallback(() => {
    setState((prev) => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;

      // Process answer evaluation
      const { answer, isCorrect, hasInput } = processAnswer(
        currentCharacter,
        prev.pinyinInput,
        prev.current
      );

      // Update incorrect answers if wrong
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        newIncorrectAnswers.push(answer);
      }

      // Update counters
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newTotalAttempted = hasInput ? prev.totalAttempted + 1 : prev.totalAttempted;
      const newTotalSeen = prev.totalSeen + 1;

      // Add to all answers
      const newAllAnswers = [...prev.allAnswers, answer];

      // Update storage
      updateStorageAfterAnswer(
        prev.current,
        isCorrect,
        hasInput,
        newCorrectAnswers,
        newTotalAttempted,
        newTotalSeen,
        newAllAnswers,
        answer
      );

      // Calculate adaptive range expansion
      const { newAdaptiveRange, newAnswersSinceLastCheck } = calculateAdaptiveRangeExpansion(
        prev.answersSinceLastCheck,
        newTotalAttempted,
        newCorrectAnswers,
        prev.adaptiveRange
      );

      // Get next character index
      const newIndex = getNextCharacterIndex(newAdaptiveRange);

      // Create and return new state
      return createNextState(
        prev,
        answer,
        isCorrect,
        hasInput,
        newCorrectAnswers,
        newTotalAttempted,
        newTotalSeen,
        newIncorrectAnswers,
        newAllAnswers,
        newAdaptiveRange,
        newAnswersSinceLastCheck,
        newIndex
      );
    });
  }, [getCurrentCharacter]);

  const toggleHint = useCallback((hintType: HintType) => {
    setState((prev) => ({
      ...prev,
      hint: prev.hint === hintType ? HINT_TYPES.NONE : hintType,
    }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      current: getRandomCharacterIndex(prev.limit),
      totalSeen: 0,
      hint: HINT_TYPES.NONE,
      // Reset scoring
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
      // Reset answer tracking
      previousAnswer: null,
      allAnswers: [],
      incorrectAnswers: [],
    }));
  }, []);

  const resetStatistics = useCallback(() => {
    // Reset to initial adaptive range
    const initialRange = ADAPTIVE_CONFIG.INITIAL_RANGE;
    saveAdaptiveRange(initialRange);

    setState((prev) => ({
      ...prev,
      // Reset statistics
      totalSeen: 0,
      correctAnswers: 0,
      totalAttempted: 0,
      // Reset answer tracking
      previousAnswer: null,
      allAnswers: [],
      incorrectAnswers: [],
      // Reset adaptive range
      adaptiveRange: initialRange,
      answersSinceLastCheck: 0,
      // Keep current character and mode
    }));
  }, []);

  const setPinyinInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      pinyinInput: input,
      isPinyinCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  const evaluatePinyin = useCallback(() => {
    setState((prev) => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;

      const { isCorrect } = evaluatePinyinAnswer(prev.pinyinInput, currentCharacter);

      return {
        ...prev,
        isPinyinCorrect: isCorrect,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: prev.totalAttempted + 1,
      };
    });
  }, [getCurrentCharacter]);

  const resetScore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, []);

  // Display mode action - only changes what's displayed, doesn't reset state
  const setMode = useCallback((mode: FlashcardMode) => {
    // Save mode to storage
    saveMode(mode);

    setState((prev) => ({
      ...prev,
      mode,
      // Clear input when switching display modes
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, []);

  // Set flash result immediately for pinyin input
  const setPinyinFlashResult = useCallback(
    (input: string) => {
      setState((prev) => {
        const currentCharacter = getCurrentCharacter();
        if (!currentCharacter) return prev;

        const { isCorrect } = evaluatePinyinAnswer(input, currentCharacter);

        return {
          ...prev,
          pinyinInput: input,
          isPinyinCorrect: isCorrect,
          flashResult: isCorrect ? FlashResult.CORRECT : FlashResult.INCORRECT,
        };
      });
    },
    [getCurrentCharacter]
  );

  // Clear flash result after animation
  useEffect(() => {
    if (state.flashResult !== null && state.flashResult !== undefined) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, flashResult: null }));
      }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.flashResult]);

  return {
    ...state,
    getNext,
    toggleHint,
    reset,
    resetStatistics,
    setPinyinInput,
    evaluatePinyin,
    resetScore,
    setMode,
    setPinyinFlashResult,
  };
};
