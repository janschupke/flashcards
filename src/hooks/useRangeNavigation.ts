import { useEffect } from 'react';
import { FlashcardMode } from '../types';
import { APP_LIMITS, UI_CONSTANTS } from '../constants';
import data from '../data/characters.json';

interface UseRangeNavigationProps {
  currentLimit: number;
  mode: FlashcardMode;
  onLimitChange: (newLimit: number) => void;
}

export const useRangeNavigation = ({
  currentLimit,
  mode,
  onLimitChange,
}: UseRangeNavigationProps): void => {
  useEffect(() => {
    const handleArrow = (e: KeyboardEvent): void => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      // Only trigger if not focused on the range input
      const active = document.activeElement;
      if (active?.id === 'limit') return;

      const increment =
        e.key === 'ArrowUp' ? UI_CONSTANTS.INCREMENT_STEP : -UI_CONSTANTS.INCREMENT_STEP;
      const minLimit = APP_LIMITS.MIN_LIMIT;
      const maxLimit =
        mode === FlashcardMode.PINYIN
          ? Math.min(APP_LIMITS.PINYIN_MODE_MAX, data.length)
          : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX;

      const newLimit = Math.min(maxLimit, Math.max(minLimit, currentLimit + increment));
      onLimitChange(newLimit);
      e.preventDefault();
    };

    window.addEventListener('keydown', handleArrow);
    return () => window.removeEventListener('keydown', handleArrow);
  }, [currentLimit, mode, onLimitChange]);
};
