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
import { evaluatePinyinInput } from '../utils/pinyinUtils';
import { getRandomCharacterIndex, getCharacterAtIndex } from '../utils/characterUtils';
import {
  evaluatePinyinAnswer,
  evaluateCharacterAnswer,
  createIncorrectAnswer,
  createAnswer,
} from '../utils/flashcardUtils';
import {
  loadHistory,
  saveHistory,
  loadCounters,
  saveCounters,
  loadPreviousAnswer,
  savePreviousAnswer,
  loadAdaptiveRange,
  saveAdaptiveRange,
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
    // New state for traditional character feature
    displayMode: 'simplified',
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
    // New fields for flashcard modes
    mode: FlashcardMode.PINYIN,
    characterInput: '',
    isCharacterCorrect: null,
    // Adaptive learning fields
    adaptiveRange: initialAdaptiveRange,
    answersSinceLastCheck: 0,
  });

  // Get current character based on mode
  const getCurrentCharacter = useCallback((): Character | null => {
    if (state.mode === FlashcardMode.PINYIN) {
      return data[state.current] ?? null;
    } else {
      return getCharacterAtIndex(state.current, state.mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.current, state.mode]);

  const getNext = useCallback(() => {
    setState((prev) => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;

      // Evaluate answer based on mode
      const evaluation =
        prev.mode === FlashcardMode.PINYIN
          ? evaluatePinyinAnswer(prev.pinyinInput, currentCharacter)
          : evaluateCharacterAnswer(prev.characterInput, currentCharacter, prev.mode);

      const { isCorrect, hasInput } = evaluation;

      // Create answer object for tracking
      const submittedInput =
        prev.mode === FlashcardMode.PINYIN ? prev.pinyinInput : prev.characterInput;
      const answer = createAnswer(
        currentCharacter,
        prev.mode,
        submittedInput,
        prev.current,
        isCorrect
      );

      // Update character performance in storage
      if (hasInput) {
        updateCharacterPerformance(prev.current, isCorrect);
      }

      // Add to incorrect answers if wrong or empty input
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        newIncorrectAnswers.push(
          createIncorrectAnswer(currentCharacter, prev.mode, submittedInput, prev.current)
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
        characterInput: '',
        isCharacterCorrect: null,
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
      characterInput: '',
      isCharacterCorrect: null,
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

  // New actions for traditional character feature
  const setDisplayMode = useCallback((mode: 'simplified' | 'traditional' | 'both') => {
    setState((prev) => ({
      ...prev,
      displayMode: mode,
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

      const isCorrect = evaluatePinyinInput(prev.pinyinInput, currentCharacter.pinyin);

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
      characterInput: '',
      isCharacterCorrect: null,
      flashResult: null,
    }));
  }, []);

  // New actions for flashcard modes
  const setMode = useCallback((mode: FlashcardMode) => {
    setState((prev) => {
      // Preserve current limit (all modes support up to 1500)
      // Only clamp if current limit exceeds max (shouldn't happen, but safety check)
      const maxLimit = data.length; // 1500
      const newLimit = Math.min(prev.limit, maxLimit);
      return {
        ...prev,
        mode,
        limit: newLimit,
        current: getRandomCharacterIndex(newLimit),
        totalSeen: 0,
        correctAnswers: 0,
        totalAttempted: 0,
        hint: HINT_TYPES.NONE,
        pinyinInput: '',
        isPinyinCorrect: null,
        characterInput: '',
        isCharacterCorrect: null,
        flashResult: null,
        incorrectAnswers: [], // Reset incorrect answers on mode change
        allAnswers: [], // Reset all answers on mode change
        previousAnswer: null, // Reset previous answer on mode change
      };
    });
  }, []);

  const setCharacterInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      characterInput: input,
      isCharacterCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  const validateCharacter = useCallback(() => {
    setState((prev) => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;

      const { isCorrect } = evaluateCharacterAnswer(
        prev.characterInput,
        currentCharacter,
        prev.mode
      );

      return {
        ...prev,
        isCharacterCorrect: isCorrect,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: prev.totalAttempted + 1,
      };
    });
  }, [getCurrentCharacter]);

  // New functions to set flash result immediately
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

  const setCharacterFlashResult = useCallback(
    (input: string) => {
      setState((prev) => {
        const currentCharacter = getCurrentCharacter();
        if (!currentCharacter) return prev;

        const { isCorrect } = evaluateCharacterAnswer(input, currentCharacter, prev.mode);

        return {
          ...prev,
          characterInput: input,
          isCharacterCorrect: isCorrect,
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
    setDisplayMode,
    setPinyinInput,
    evaluatePinyin,
    resetScore,
    setMode,
    setCharacterInput,
    validateCharacter,
    setPinyinFlashResult,
    setCharacterFlashResult,
  };
};
