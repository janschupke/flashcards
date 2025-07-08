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

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleInputBlur = useCallback(() => {
    const newLimit = validateLimit(inputValue, data.length);
    if (newLimit !== undefined) {
      setInputValue(newLimit.toString());
      onLimitChange(newLimit);
    }
  }, [inputValue, onLimitChange]);

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
        max={data.length}
        data-testid="range-input"
      />
    </SettingsSection>
  );
}; 
