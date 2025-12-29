/**
 * Gets the color class for answer text based on correctness
 * @param isCorrect - Whether the answer is correct (true/false/null)
 * @returns Tailwind CSS class for text color
 */
export const getAnswerColorClass = (isCorrect: boolean | null): string => {
  if (isCorrect === null) return 'text-text-secondary';
  return isCorrect ? 'text-success' : 'text-error';
};
