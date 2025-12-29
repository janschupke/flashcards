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
import { evaluatePinyinAnswer, createIncorrectAnswer, createAnswer } from '../utils/flashcardUtils';
import {
  loadHistory,
  saveHistory,
  loadCounters,
  saveCounters,
  loadPreviousAnswer,
  savePreviousAnswer,
  loadAdaptiveRange,
  saveAdaptiveRange,
  loadMode,
  saveMode,
  updateCharacterPerformance,
  getAllCharacterPerformance,
} from '../utils/storageUtils';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { selectAdaptiveCharacter } from '../utils/adaptiveUtils';
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
    // All answers tracking
    allAnswers: storedHistory,
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

      // Always evaluate pinyin answer
      const evaluation = evaluatePinyinAnswer(prev.pinyinInput, currentCharacter);
      const { isCorrect, hasInput } = evaluation;

      // Create answer object for tracking (always pinyin)
      const answer = createAnswer(currentCharacter, prev.pinyinInput, prev.current, isCorrect);

      // Update character performance in storage
      if (hasInput) {
        updateCharacterPerformance(prev.current, isCorrect);
      }

      // Add to incorrect answers if wrong or empty input
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        newIncorrectAnswers.push(
          createIncorrectAnswer(currentCharacter, prev.pinyinInput, prev.current)
        );
      }

      // Add to all answers (both correct and incorrect)
      const newAllAnswers = [...prev.allAnswers, answer];

      // Update counters
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newTotalAttempted = hasInput ? prev.totalAttempted + 1 : prev.totalAttempted;
      const newTotalSeen = prev.totalSeen + 1;

      // Save counters to storage
      saveCounters({
        correctAnswers: newCorrectAnswers,
        totalSeen: newTotalSeen,
        totalAttempted: newTotalAttempted,
      });

      // Save history to storage
      saveHistory(newAllAnswers);

      // Save previous answer to storage
      savePreviousAnswer(answer);

      // Update adaptive range expansion tracking
      const newAnswersSinceLastCheck = prev.answersSinceLastCheck + 1;
      let newAdaptiveRange = prev.adaptiveRange;
      let shouldExpand = false;

      // Check if we should expand the range
      if (
        newAnswersSinceLastCheck >= ADAPTIVE_CONFIG.EXPANSION_INTERVAL &&
        newTotalAttempted >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_EXPANSION
      ) {
        // Calculate success rate for current range
        const successRate = newTotalAttempted > 0 ? newCorrectAnswers / newTotalAttempted : 0;

        if (successRate >= ADAPTIVE_CONFIG.SUCCESS_THRESHOLD) {
          // Expand range
          const maxRange = Math.min(
            prev.adaptiveRange + ADAPTIVE_CONFIG.EXPANSION_AMOUNT,
            data.length
          );
          newAdaptiveRange = maxRange;
          shouldExpand = true;
        }
      }

      // Save adaptive range to storage
      saveAdaptiveRange(newAdaptiveRange);

      // Get new character index using adaptive selection
      const effectiveLimit = Math.min(newAdaptiveRange, data.length);
      const charactersInRange = Array.from({ length: effectiveLimit }, (_, i) => i);
      const performance = getAllCharacterPerformance();
      const newIndex = selectAdaptiveCharacter(charactersInRange, performance);

      return {
        ...prev,
        previousCharacter: prev.current,
        previousAnswer: answer,
        current: newIndex,
        limit: effectiveLimit,
        hint: HINT_TYPES.NONE,
        totalSeen: newTotalSeen,
        pinyinInput: '',
        isPinyinCorrect: null,
        correctAnswers: newCorrectAnswers,
        totalAttempted: newTotalAttempted,
        flashResult: hasInput ? (isCorrect ? FlashResult.CORRECT : FlashResult.INCORRECT) : null,
        incorrectAnswers: newIncorrectAnswers,
        allAnswers: newAllAnswers,
        adaptiveRange: newAdaptiveRange,
        answersSinceLastCheck: shouldExpand ? 0 : newAnswersSinceLastCheck,
      };
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
      }, 1000);
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
