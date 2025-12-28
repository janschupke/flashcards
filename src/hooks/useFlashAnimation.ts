import { useState, useEffect, useRef } from 'react';
import { FlashResult } from '../types';
import { ANIMATION_TIMINGS } from '../constants';

/**
 * Hook to manage flash animation state for input feedback
 * @param flashResult - The flash result (CORRECT or INCORRECT) or null
 * @returns Boolean indicating if the component should be in flashing state
 */
export const useFlashAnimation = (flashResult: FlashResult | null): boolean => {
  // Derive initial state from flashResult
  const [isFlashing, setIsFlashing] = useState(
    () => flashResult !== null && flashResult !== undefined
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const immediateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFlashResultRef = useRef<FlashResult | null>(null);

  useEffect(() => {
    // Only update if flashResult actually changed
    if (prevFlashResultRef.current === flashResult) {
      return undefined;
    }
    prevFlashResultRef.current = flashResult;

    // Clear any existing timers
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (immediateTimerRef.current !== null) {
      clearTimeout(immediateTimerRef.current);
      immediateTimerRef.current = null;
    }

    const isActive = flashResult !== null && flashResult !== undefined;

    if (isActive) {
      // Schedule immediate state update using setTimeout(0) to avoid setState-in-effect warning
      // This works with both real timers and fake timers in tests
      immediateTimerRef.current = setTimeout(() => {
        setIsFlashing(true);
        immediateTimerRef.current = null;
        // Schedule reset after animation duration
        timerRef.current = setTimeout(() => {
          setIsFlashing(false);
          timerRef.current = null;
        }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      }, 0);
      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (immediateTimerRef.current !== null) {
          clearTimeout(immediateTimerRef.current);
          immediateTimerRef.current = null;
        }
      };
    } else {
      // Reset when flashResult becomes null - schedule immediately
      immediateTimerRef.current = setTimeout(() => {
        setIsFlashing(false);
        immediateTimerRef.current = null;
      }, 0);
      return () => {
        if (immediateTimerRef.current !== null) {
          clearTimeout(immediateTimerRef.current);
          immediateTimerRef.current = null;
        }
      };
    }
  }, [flashResult]);

  return isFlashing;
};
