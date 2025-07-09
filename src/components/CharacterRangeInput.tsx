import React, { useState, useCallback, useEffect } from 'react';
import { SettingsSection, SettingsLabel } from './styled';
import { validateLimit } from '../utils/characterUtils';
import data from '../data.json';
import styled from 'styled-components';

interface CharacterRangeInputProps {
  currentLimit: number;
  onLimitChange: (newLimit: number) => void;
}

const RangeInput = styled.input<{ $showError: boolean; $flashKey: number }>`
  width: 100%;
  max-width: 200px;
  padding: 12px 16px;
  border: 2px solid ${props => props.$showError ? '#dc3545' : '#4a5568'};
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
}) => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());
  const [showError, setShowError] = useState(false);
  const [errorFlashKey] = useState(0); // force re-render for flash
  const maxLimit = Math.min(1500, data.length); // Use data length as max, but cap at 1500
  const minLimit = 50;

  const handleInputChange = useCallback((value: string) => {
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
    const newLimit = validateLimit(inputValue, maxLimit);
    if (newLimit !== undefined) {
      const clampedLimit = Math.max(minLimit, Math.min(maxLimit, newLimit));
      setInputValue(clampedLimit.toString());
      onLimitChange(clampedLimit);
    }
  }, [inputValue, onLimitChange, maxLimit, minLimit]);

  // In handleKeyDown, always clamp and flash red if out of bounds
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseInt(inputValue, 10) || currentLimit;
      const increment = e.key === 'ArrowUp' ? 50 : -50;
      let newValue = currentValue + increment;
      let flash = false;
      if (newValue > maxLimit) {
        newValue = maxLimit;
        flash = true;
      } else if (newValue < minLimit) {
        newValue = minLimit;
        flash = true;
      }
      if (flash) {
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
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
      <SettingsLabel htmlFor="limit">Character Range</SettingsLabel>
      <RangeInput
        id="limit"
        type="number"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="100"
        min={minLimit}
        max={maxLimit}
        data-testid="range-input"
        $showError={showError}
        $flashKey={errorFlashKey}
      />
    </SettingsSection>
  );
}; 
