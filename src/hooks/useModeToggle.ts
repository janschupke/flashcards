import { useCallback } from 'react';
import { FlashcardMode } from '../types';

/**
 * Hook to handle mode toggle logic
 * @param currentMode - The currently active flashcard mode
 * @param onModeChange - Callback function when mode changes
 * @returns Object containing handleModeChange function
 */
export const useModeToggle = (
  currentMode: FlashcardMode,
  onModeChange: (mode: FlashcardMode) => void
): { handleModeChange: (mode: FlashcardMode) => void } => {
  const handleModeChange = useCallback(
    (mode: FlashcardMode) => {
      if (mode !== currentMode) {
        onModeChange(mode);
      }
    },
    [currentMode, onModeChange]
  );

  return { handleModeChange };
};

