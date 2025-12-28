import { useEffect } from 'react';
import { FlashcardMode } from '../types';
import { MODES } from '../components/controls/ModeToggleButtons';

interface UseModeNavigationProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
}

export const useModeNavigation = ({ currentMode, onModeChange }: UseModeNavigationProps): void => {
  useEffect(() => {
    const handleArrowModeSwitch = (e: KeyboardEvent): void => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const modeIndex = MODES.findIndex((m) => m.mode === currentMode);
      if (modeIndex === -1) return;

      if (e.key === 'ArrowLeft' && modeIndex > 0) {
        const prevMode = MODES[modeIndex - 1];
        if (prevMode) {
          onModeChange(prevMode.mode);
          e.preventDefault();
        }
      } else if (e.key === 'ArrowRight' && modeIndex < MODES.length - 1) {
        const nextMode = MODES[modeIndex + 1];
        if (nextMode) {
          onModeChange(nextMode.mode);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleArrowModeSwitch);
    return () => window.removeEventListener('keydown', handleArrowModeSwitch);
  }, [currentMode, onModeChange]);
};
