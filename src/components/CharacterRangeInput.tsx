import React, { useState, useCallback, useEffect } from 'react';
import { SettingsSection, SettingsLabel } from './styled';
import { validateLimit } from '../utils/characterUtils';
import { APP_LIMITS, UI_CONSTANTS, CHINESE_TEXT } from '../constants';
import data from '../data.json';
import styled from 'styled-components';

interface CharacterRangeInputProps {
  currentLimit: number;
  onLimitChange: (newLimit: number) => void;
  minLimit?: number;
  maxLimit?: number;
}

const RangeInput = styled.input`
  width: 100%;
  max-width: 200px;
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
  outline: none;
  background: #2d3748;
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
  }

  &::placeholder {
    color: #718096;
  }
`;

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
    <SettingsSection>
      <SettingsLabel htmlFor="limit">{CHINESE_TEXT.LABELS.CHARACTER_RANGE(minLimit, maxLimit)}</SettingsLabel>
      <RangeInput
        id="limit"
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        min={minLimit}
        max={maxLimit}
        autoFocus
        data-testid="range-input"
      />
    </SettingsSection>
  );
}; 
