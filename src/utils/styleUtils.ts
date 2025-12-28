import { InputVariant } from '../types/components';

/**
 * Gets the color class for answer text based on correctness
 * @param isCorrect - Whether the answer is correct (true/false/null)
 * @returns Tailwind CSS class for text color
 */
export const getAnswerColorClass = (isCorrect: boolean | null): string => {
  if (isCorrect === null) return 'text-text-secondary';
  return isCorrect ? 'text-success' : 'text-error';
};

/**
 * Gets the border color class based on input variant
 * @param variant - The input variant (SUCCESS, ERROR, or DEFAULT)
 * @returns Tailwind CSS class for border color
 */
export const getBorderColorClass = (variant: InputVariant): string => {
  if (variant === InputVariant.SUCCESS) return 'border-success';
  if (variant === InputVariant.ERROR) return 'border-error';
  return 'border-border-secondary';
};
