import React, { useState, useCallback, useEffect } from 'react';
import { validateLimit } from '../../utils/characterUtils';
import { APP_LIMITS, UI_CONSTANTS, CHINESE_TEXT } from '../../constants';
import data from '../../data/characters.json';

interface CharacterRangeInputProps {
  currentLimit: number;
  onLimitChange: (newLimit: number) => void;
  minLimit?: number;
  maxLimit?: number;
}

export const CharacterRangeInput: React.FC<CharacterRangeInputProps> = ({
  currentLimit,
  onLimitChange,
  minLimit = APP_LIMITS.MIN_LIMIT,
  maxLimit = Math.min(APP_LIMITS.PINYIN_MODE_MAX, data.length),
}) => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clamp value to max allowed
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      if (parsed > maxLimit) {
        setInputValue(maxLimit.toString());
        return;
      }
      if (parsed < minLimit) {
        setInputValue(minLimit.toString());
        return;
      }
    }
    setInputValue(value);
  }, [maxLimit, minLimit]);

  const handleInputBlur = useCallback(() => {
    const newLimit = validateLimit(inputValue, minLimit, maxLimit);
    setInputValue(newLimit.toString());
    onLimitChange(newLimit);
  }, [inputValue, onLimitChange, maxLimit, minLimit]);

  // In handleKeyDown, always clamp to bounds
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseInt(inputValue, 10) || currentLimit;
      const increment = e.key === 'ArrowUp' ? UI_CONSTANTS.INCREMENT_STEP : -UI_CONSTANTS.INCREMENT_STEP;
      let newValue = currentValue + increment;
      if (newValue > maxLimit) {
        newValue = maxLimit;
      } else if (newValue < minLimit) {
        newValue = minLimit;
      }
      setInputValue(newValue.toString());
      onLimitChange(newValue);
    }
  }, [inputValue, currentLimit, onLimitChange, minLimit, maxLimit]);

  // Update input value when currentLimit changes externally
  useEffect(() => {
    setInputValue(currentLimit.toString());
  }, [currentLimit]);

  return (
    <div className="mb-7 p-5 bg-primary/10 rounded-2xl border border-primary/20">
      <label htmlFor="limit" className="block text-[0.9rem] font-semibold text-textc-secondary mb-2 uppercase tracking-[0.5px]">
        {CHINESE_TEXT.LABELS.CHARACTER_RANGE(minLimit, maxLimit)}
      </label>
      <input
        id="limit"
        type="number"
        className="w-full max-w-[200px] px-4 py-3 border-2 border-secondary rounded-xl text-base bg-secondary-dark text-white outline-none focus:shadow-[0_0_0_3px_rgba(74,85,104,0.1)] placeholder:text-secondary-light"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        min={minLimit}
        max={maxLimit}
        autoFocus
        data-testid="range-input"
      />
    </div>
  );
}; 
