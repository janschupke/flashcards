import { useState, useEffect } from 'react';
import { FlashResult } from '../types';
import { ANIMATION_TIMINGS } from '../constants';

/**
 * Hook to manage flash animation state for input feedback
 * @param flashResult - The flash result (CORRECT or INCORRECT) or null
 * @returns Boolean indicating if the component should be in flashing state
 */
export const useFlashAnimation = (flashResult: FlashResult | null): boolean => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (flashResult !== null && flashResult !== undefined) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      return () => clearTimeout(timer);
    } else {
      // Reset immediately when flashResult becomes null
      setIsFlashing(false);
    }
    return undefined;
  }, [flashResult]);

  return isFlashing;
};

