import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage range input state and validation
 * @param currentLimit - The current limit value
 * @param minLimit - The minimum allowed limit
 * @param maxLimit - The maximum allowed limit
 * @param onLimitChange - Callback function when limit changes
 * @returns Object containing inputValue, handleChange, and handleBlur
 */
export const useRangeInput = (
  currentLimit: number,
  minLimit: number,
  maxLimit: number,
  onLimitChange: (newLimit: number) => void
): {
  inputValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
} => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(minLimit, Math.min(maxLimit, parsed));
        setInputValue(clamped.toString());
        onLimitChange(clamped);
      } else {
        setInputValue(value);
      }
    },
    [minLimit, maxLimit, onLimitChange]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < minLimit) {
        onLimitChange(minLimit);
        setInputValue(minLimit.toString());
      } else if (value > maxLimit) {
        onLimitChange(maxLimit);
        setInputValue(maxLimit.toString());
      } else {
        onLimitChange(value);
        setInputValue(value.toString());
      }
    },
    [minLimit, maxLimit, onLimitChange]
  );

  useEffect(() => {
    setInputValue(currentLimit.toString());
  }, [currentLimit]);

  return { inputValue, handleChange, handleBlur };
};

