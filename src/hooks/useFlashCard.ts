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
import {
  getModeSpecificLimit,
  getRandomCharacterIndex,
  getCharacterAtIndex,
} from '../utils/characterUtils';
import {
  evaluatePinyinAnswer,
  evaluateCharacterAnswer,
  createIncorrectAnswer,
} from '../utils/flashcardUtils';
import data from '../data/characters.json';

interface UseFlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export const useFlashCard = ({
  initialCurrent,
  initialLimit,
}: UseFlashCardProps = {}): FlashCardState & FlashCardActions => {
  const defaultLimit =
    initialLimit !== undefined ? Math.min(initialLimit, data.length) : Math.min(1500, data.length);

  // Initialize current index - use useState initializer to avoid Math.random in render
  const [initialCurrentIndex] = useState<number>(() => {
    return initialCurrent ?? Math.floor(Math.random() * defaultLimit);
  });

  const [state, setState] = useState<FlashCardState>({
    current: initialCurrentIndex,
    limit: defaultLimit,
    hint: HINT_TYPES.NONE,
    totalSeen: 0,
    // New state for traditional character feature
    displayMode: 'simplified',
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: 0,
    totalAttempted: 0,
    flashResult: null,
    // Previous character tracking
    previousCharacter: null,
    // Incorrect answers tracking
    incorrectAnswers: [],
    // New fields for flashcard modes
    mode: FlashcardMode.PINYIN,
    characterInput: '',
    isCharacterCorrect: null,
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

      // Add to incorrect answers if wrong or empty input
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        const submittedInput =
          prev.mode === FlashcardMode.PINYIN ? prev.pinyinInput : prev.characterInput;
        newIncorrectAnswers.push(
          createIncorrectAnswer(currentCharacter, prev.mode, submittedInput, prev.current)
        );
      }

      // Get new random index based on current mode
      const newIndex = getRandomCharacterIndex(prev.mode, prev.limit);

      return {
        ...prev,
        previousCharacter: prev.current,
        current: newIndex,
        hint: HINT_TYPES.NONE,
        totalSeen: prev.totalSeen + 1,
        pinyinInput: '',
        isPinyinCorrect: null,
        characterInput: '',
        isCharacterCorrect: null,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: hasInput ? prev.totalAttempted + 1 : prev.totalAttempted,
        flashResult: hasInput ? (isCorrect ? FlashResult.CORRECT : FlashResult.INCORRECT) : null,
        incorrectAnswers: newIncorrectAnswers,
      };
    });
  }, [getCurrentCharacter]);

  const toggleHint = useCallback((hintType: HintType) => {
    setState((prev) => ({
      ...prev,
      hint: prev.hint === hintType ? HINT_TYPES.NONE : hintType,
    }));
  }, []);

  const updateLimit = useCallback(
    (newLimit: number) => {
      const maxLimit = Math.min(newLimit, getModeSpecificLimit(state.mode));
      setState((prev) => ({
        ...prev,
        limit: maxLimit,
        // Don't reset current character or totalSeen
        // Don't reset scoring
        hint: HINT_TYPES.NONE,
        pinyinInput: '',
        isPinyinCorrect: null,
        characterInput: '',
        isCharacterCorrect: null,
        flashResult: null,
      }));
    },
    [state.mode]
  );

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      current: getRandomCharacterIndex(prev.mode, prev.limit),
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
      const newMaxLimit = getModeSpecificLimit(mode);
      // Always use the max available for the mode as the default limit
      const newLimit = newMaxLimit;
      return {
        ...prev,
        mode,
        limit: newLimit,
        current: getRandomCharacterIndex(mode, newLimit),
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
    updateLimit,
    reset,
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
