import React, { useState, useCallback, useEffect } from 'react';
import { SettingsSection, SettingsLabel, SettingsInput } from './styled';
import { validateLimit } from '../utils/characterUtils';
import data from '../data.json';
import styled from 'styled-components';

interface CharacterRangeInputProps {
  currentLimit: number;
  onLimitChange: (newLimit: number) => void;
}

const StyledSettingsInput = styled(SettingsInput)<{ $showError: boolean }>`
  border-color: ${props => props.$showError ? '#dc3545' : '#ced4da'};
  transition: border-color 1s ease-out;
`;

export const CharacterRangeInput: React.FC<CharacterRangeInputProps> = ({
  currentLimit,
  onLimitChange,
}) => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());
  const [showError, setShowError] = useState(false);
  const maxLimit = data.length;
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
      setInputValue(newLimit.toString());
      onLimitChange(newLimit);
    }
  }, [inputValue, onLimitChange, maxLimit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      const currentValue = parseInt(inputValue, 10) || currentLimit;
      const increment = e.key === 'ArrowUp' ? 50 : -50;
      const newValue = currentValue + increment;
      
      // Check if the new value would exceed limits
      if (newValue < minLimit || newValue > maxLimit) {
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
      }
      
      // Always clamp to valid range and call onLimitChange
      const newLimit = Math.max(minLimit, Math.min(maxLimit, newValue));
      setInputValue(newLimit.toString());
      onLimitChange(newLimit);
    }
  }, [inputValue, currentLimit, onLimitChange, minLimit, maxLimit]);

  // Update input value when currentLimit changes externally
  useEffect(() => {
    setInputValue(currentLimit.toString());
  }, [currentLimit]);

  return (
    <SettingsSection>
      <SettingsLabel htmlFor="limit">Character Range</SettingsLabel>
      <StyledSettingsInput
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
      />
    </SettingsSection>
  );
}; 
