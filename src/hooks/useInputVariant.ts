import { useMemo } from 'react';
import { FlashResult } from '../types';
import { InputVariant } from '../types/components';

/**
 * Hook to calculate input variant and associated styling classes
 * @param isFlashing - Whether the input is currently flashing
 * @param flashResult - The flash result (CORRECT or INCORRECT) or null
 * @param isCorrect - Whether the input value is correct (true/false/null)
 * @returns Object containing variant, borderClass, and feedbackClass
 */
export const useInputVariant = (
  isFlashing: boolean,
  flashResult: FlashResult | null,
  isCorrect: boolean | null
): { variant: InputVariant; borderClass: string; feedbackClass: string } => {
  const variant = useMemo(() => {
    if (isFlashing) {
      return flashResult === FlashResult.CORRECT ? InputVariant.SUCCESS : InputVariant.ERROR;
    }
    if (isCorrect === true) return InputVariant.SUCCESS;
    if (isCorrect === false) return InputVariant.ERROR;
    return InputVariant.DEFAULT;
  }, [isFlashing, flashResult, isCorrect]);

  const borderClass = useMemo(() => {
    if (variant === InputVariant.SUCCESS) return 'border-success';
    if (variant === InputVariant.ERROR) return 'border-error';
    return 'border-border-secondary';
  }, [variant]);

  const feedbackClass = useMemo(() => {
    if (variant === InputVariant.SUCCESS) return 'text-success';
    if (variant === InputVariant.ERROR) return 'text-error';
    return 'text-text-tertiary';
  }, [variant]);

  return { variant, borderClass, feedbackClass };
};
