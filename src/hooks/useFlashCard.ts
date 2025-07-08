import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashCardState, FlashCardActions, HintType, HINT_TYPES, DEFAULT_CONFIG } from '../types';
import data from '../output.json';

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
  });

  // Memoize progress calculation to avoid unnecessary recalculations
  const progress = useMemo(() => {
    return state.limit > 0 ? (state.totalSeen / state.limit) * 100 : 0;
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
    setState(prev => ({
      ...prev,
      current: getRandomIndex(prev.limit),
      hint: HINT_TYPES.NONE,
      totalSeen: prev.totalSeen + 1,
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
    }));
  }, [getRandomIndex]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: getRandomIndex(prev.limit),
      totalSeen: 0,
      hint: HINT_TYPES.NONE,
    }));
  }, [getRandomIndex]);

  return {
    ...state,
    getNext,
    toggleHint,
    updateLimit,
    reset,
  };
}; 
