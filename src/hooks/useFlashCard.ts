import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashCardState, FlashCardActions, HintType, HINT_TYPES } from '../types';
import { evaluatePinyinInput } from '../utils/pinyinUtils';
import data from '../data.json';

interface UseFlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export const useFlashCard = ({ initialCurrent, initialLimit }: UseFlashCardProps = {}): FlashCardState & FlashCardActions => {
  const defaultLimit = initialLimit !== undefined ? Math.min(initialLimit, data.length) : Math.min(1500, data.length);
  
  const [state, setState] = useState<FlashCardState>({
    current: initialCurrent !== undefined ? initialCurrent : Math.floor(Math.random() * defaultLimit),
    limit: defaultLimit,
    hint: HINT_TYPES.NONE,
    totalSeen: 0,
    progress: 0,
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
  });

  // Memoize progress calculation to avoid unnecessary recalculations
  const progress = useMemo(() => {
    return state.limit > 0 ? Math.min((state.totalSeen / state.limit) * 100, 100) : 0;
  }, [state.totalSeen, state.limit]);

  // Update progress when dependencies change
  useEffect(() => {
    setState(prev => ({ ...prev, progress }));
  }, [progress]);

  // Memoized random number generator for better performance
  const getRandomIndex = useCallback((max: number): number => {
    return Math.floor(Math.random() * max);
  }, []);

  const getNext = useCallback(() => {
    setState(prev => {
      const currentCharacter = data[prev.current];
      const trimmedInput = prev.pinyinInput.trim();
      const hasInput = trimmedInput.length > 0;
      const isCorrect = hasInput ? evaluatePinyinInput(prev.pinyinInput, currentCharacter.pinyin) : false;
      
      // Add to incorrect answers if wrong or empty input
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        newIncorrectAnswers.push({
          characterIndex: prev.current,
          submittedPinyin: prev.pinyinInput.trim() || '(empty)',
          correctPinyin: currentCharacter.pinyin,
          chinese: currentCharacter.chinese,
          english: currentCharacter.english,
        });
      }
      
      return {
        ...prev,
        previousCharacter: prev.current, // Store current as previous
        current: getRandomIndex(prev.limit),
        hint: HINT_TYPES.NONE,
        totalSeen: prev.totalSeen + 1,
        // Reset pinyin input state for new character
        pinyinInput: '',
        isPinyinCorrect: null,
        // Update scoring
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: hasInput ? prev.totalAttempted + 1 : prev.totalAttempted,
        // Set flash result based on pinyin evaluation
        flashResult: prev.pinyinInput.trim() ? (isCorrect ? 'correct' : 'incorrect') : null,
        // Update incorrect answers
        incorrectAnswers: newIncorrectAnswers,
      };
    });
  }, [getRandomIndex]);

  const toggleHint = useCallback((hintType: HintType) => {
    setState(prev => ({
      ...prev,
      hint: prev.hint === hintType ? HINT_TYPES.NONE : hintType,
    }));
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    const maxLimit = Math.min(newLimit, data.length);
    setState(prev => ({
      ...prev,
      limit: maxLimit,
      // Don't reset current character or totalSeen
      // Don't reset scoring
      hint: HINT_TYPES.NONE,
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: getRandomIndex(prev.limit),
      totalSeen: 0,
      hint: HINT_TYPES.NONE,
      // Reset scoring
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, [getRandomIndex]);

  // New actions for traditional character feature
  const setDisplayMode = useCallback((mode: 'simplified' | 'traditional' | 'both') => {
    setState(prev => ({
      ...prev,
      displayMode: mode,
    }));
  }, []);

  const setPinyinInput = useCallback((input: string) => {
    setState(prev => ({
      ...prev,
      pinyinInput: input,
      isPinyinCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  const evaluatePinyin = useCallback(() => {
    setState(prev => {
      const currentCharacter = data[prev.current];
      const isCorrect = evaluatePinyinInput(prev.pinyinInput, currentCharacter.pinyin);
      
      return {
        ...prev,
        isPinyinCorrect: isCorrect,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: prev.totalAttempted + 1,
      };
    });
  }, []);

  const resetScore = useCallback(() => {
    setState(prev => ({
      ...prev,
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, []);

  // Clear flash result after animation
  useEffect(() => {
    if (state.flashResult) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, flashResult: null }));
      }, 1000);
      return () => clearTimeout(timer);
    }
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
  };
}; 
