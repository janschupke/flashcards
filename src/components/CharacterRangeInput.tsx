import React, { useState, useCallback } from 'react';
import { SettingsSection, SettingsLabel, SettingsInput } from './styled';
import { validateLimit } from '../utils/characterUtils';
import data from '../output.json';

interface CharacterRangeInputProps {
  currentLimit: number;
  onLimitChange: (newLimit: number) => void;
}

export const CharacterRangeInput: React.FC<CharacterRangeInputProps> = ({
  currentLimit,
  onLimitChange,
}) => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());
  const maxLimit = data.length;

  const handleInputChange = useCallback((value: string) => {
    // Clamp value to max allowed
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      if (parsed > maxLimit) {
        setInputValue(maxLimit.toString());
        return;
      }
      if (parsed < 1) {
        setInputValue('1');
        return;
      }
    }
    setInputValue(value);
  }, [maxLimit]);

  const handleInputBlur = useCallback(() => {
    const newLimit = validateLimit(inputValue, maxLimit);
    if (newLimit !== undefined) {
      setInputValue(newLimit.toString());
      onLimitChange(newLimit);
    }
  }, [inputValue, onLimitChange, maxLimit]);

  return (
    <SettingsSection>
      <SettingsLabel htmlFor="limit">Character Range</SettingsLabel>
      <SettingsInput
        id="limit"
        type="number"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        placeholder="100"
        min="1"
        max={maxLimit}
        data-testid="range-input"
      />
    </SettingsSection>
  );
}; 
