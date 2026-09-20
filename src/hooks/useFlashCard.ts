import { useState, useEffect, useCallback } from 'react';
import {
  FlashCardState,
  FlashCardActions,
  HintType,
  HINT_TYPES,
  FlashcardMode,
  Character,
} from '../types';
import {
  loadHistory,
  loadCounters,
  loadPreviousAnswer,
  loadAdaptiveRange,
  loadMode,
  saveMode,
  saveAdaptiveRange,
} from '../utils/storageUtils';
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
  // Lazy initializer: load storage data and compute initial state only once on mount
  const [state, setState] = useState<FlashCardState>(() => {
    // Load data from storage
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

    // Initialize current index - use effectiveLimit for random selection
    const initialCurrentIndex = initialCurrent ?? Math.floor(Math.random() * effectiveLimit);

    return {
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
      recentAnswers: [], // Last 10 answers for expansion calculation
    };
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
      // Empty answers are still attempts (incorrect ones), so count them
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newTotalAttempted = prev.totalAttempted + 1;
      const newTotalSeen = prev.totalSeen + 1;

      // Add to all answers
      const newAllAnswers = [...prev.allAnswers, answer];

      // Maintain last 10 answers for expansion calculation
      const newRecentAnswers = [...prev.recentAnswers, answer].slice(
        -ADAPTIVE_CONFIG.EXPANSION_INTERVAL
      );

      // Update storage
      updateStorageAfterAnswer(
        prev.current,
        isCorrect,
        newCorrectAnswers,
        newTotalAttempted,
        newTotalSeen,
        newAllAnswers,
        answer
      );

      // Calculate adaptive range expansion using recent answers
      const { newAdaptiveRange, shouldExpand } = calculateAdaptiveRangeExpansion(
        newRecentAnswers,
        prev.adaptiveRange
      );

      // If expansion happened, clear recent answers to start fresh
      const finalRecentAnswers = shouldExpand ? [] : newRecentAnswers;

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
        finalRecentAnswers,
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
      recentAnswers: [],
      // Reset adaptive range
      adaptiveRange: initialRange,
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
    resetStatistics,
    setPinyinInput,
    setMode,
  };
};
