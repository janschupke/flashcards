import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashCardState, FlashCardActions, HintType, HINT_TYPES, DEFAULT_CONFIG, DisplayMode } from '../types';
import { evaluatePinyinInput } from '../utils/pinyinUtils';
import data from '../data.json';

interface UseFlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export const useFlashCard = ({ initialCurrent, initialLimit }: UseFlashCardProps = {}): FlashCardState & FlashCardActions => {
  const defaultLimit = Math.min(initialLimit ?? DEFAULT_CONFIG.DEFAULT_LIMIT, data.length);
  
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
  });

  // Memoize progress calculation to avoid unnecessary recalculations
  const progress = useMemo(() => {
    return state.limit > 0 ? (state.totalSeen / state.limit) * 100 : 0;
  }, [state.totalSeen, state.limit]);

  // Calculate percentage for scoring
  const percentage = useMemo(() => {
    return state.totalAttempted > 0 ? (state.correctAnswers / state.totalAttempted) * 100 : 0;
  }, [state.correctAnswers, state.totalAttempted]);

  // Update progress when dependencies change
  useEffect(() => {
    setState(prev => ({ ...prev, progress }));
  }, [progress]);

  // Memoized random number generator for better performance
  const getRandomIndex = useCallback((max: number): number => {
    return Math.floor(Math.random() * max);
  }, []);

  const getNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: getRandomIndex(prev.limit),
      hint: HINT_TYPES.NONE,
      totalSeen: prev.totalSeen + 1,
      // Reset pinyin input state for new character
      pinyinInput: '',
      isPinyinCorrect: null,
    }));
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
      current: getRandomIndex(maxLimit),
      totalSeen: 0,
      hint: HINT_TYPES.NONE,
      // Reset scoring when changing limit
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
    }));
  }, [getRandomIndex]);

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
    }));
  }, [getRandomIndex]);

  // New actions for traditional character feature
  const setDisplayMode = useCallback((mode: DisplayMode) => {
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
    }));
  }, []);

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
