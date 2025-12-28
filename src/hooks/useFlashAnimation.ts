import { useState, useEffect, useRef } from 'react';
import { FlashResult } from '../types';
import { ANIMATION_TIMINGS } from '../constants';

/**
 * Hook to manage flash animation state for input feedback
 * @param flashResult - The flash result (CORRECT or INCORRECT) or null
 * @returns Boolean indicating if the component should be in flashing state
 */
export const useFlashAnimation = (flashResult: FlashResult | null): boolean => {
  // Initialize state based on flashResult to handle immediate updates
  const [isFlashing, setIsFlashing] = useState(
    () => flashResult !== null && flashResult !== undefined
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFlashResultRef = useRef<FlashResult | null>(null); // Initialize to null so first effect always runs

  useEffect(() => {
    // Only update if flashResult actually changed
    if (prevFlashResultRef.current === flashResult) {
      return undefined;
    }
    prevFlashResultRef.current = flashResult;

    // Clear any existing timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (flashResult !== null && flashResult !== undefined) {
      // For animation feedback, immediate state update is acceptable
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFlashing(true);
      // Schedule reset after animation duration
      timerRef.current = setTimeout(() => {
        setIsFlashing(false);
        timerRef.current = null;
      }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Reset when flashResult becomes null
      setIsFlashing(false);
      return undefined;
    }
  }, [flashResult]);

  return isFlashing;
};
