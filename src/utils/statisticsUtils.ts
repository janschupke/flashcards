import { SUCCESS_RATE_THRESHOLDS } from '../constants';

/**
 * Calculates the success rate from correct and total attempts
 * @param correct - Number of correct answers
 * @param total - Total number of attempts
 * @returns Success rate as a number between 0 and 1
 */
export const calculateSuccessRate = (correct: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return correct / total;
};

/**
 * Formats a success rate as a percentage string
 * @param rate - Success rate (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "85.5%")
 */
export const formatSuccessRatePercent = (rate: number, decimals: number = 1): string => {
  return (rate * 100).toFixed(decimals);
};

/**
 * Gets the color class for a success rate
 * @param rate - Success rate (0-1)
 * @returns Tailwind CSS class for the success rate color
 */
export const getSuccessRateColorClass = (rate: number): string => {
  if (rate >= SUCCESS_RATE_THRESHOLDS.MASTERED) {
    return 'text-success';
  }
  if (rate >= SUCCESS_RATE_THRESHOLDS.LEARNING) {
    return 'text-warning';
  }
  return 'text-error';
};
