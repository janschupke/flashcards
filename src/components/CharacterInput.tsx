import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CharacterInputProps } from '../types';

const InputContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const InputField = styled.input<{ isCorrect: boolean | null; flashResult: 'correct' | 'incorrect' | null }>`
  width: 100%;
  max-width: 200px;
  padding: 16px 20px;
  font-size: 24px;
  text-align: center;
  border: 3px solid ${props => {
    if (props.flashResult === 'correct') return '#10b981';
    if (props.flashResult === 'incorrect') return '#ef4444';
    if (props.isCorrect === true) return '#10b981';
    if (props.isCorrect === false) return '#ef4444';
    return '#d1d5db';
  }};
  border-radius: 12px;
  background-color: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const InputLabel = styled.div`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FeedbackText = styled.div<{ isCorrect: boolean | null }>`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    if (props.isCorrect === true) return '#10b981';
    if (props.isCorrect === false) return '#ef4444';
    return '#6b7280';
  }};
  min-height: 20px;
`;

export const CharacterInput: React.FC<CharacterInputProps> = ({
  value,
  onChange,
  expectedCharacter,
  onSubmit,
  isCorrect,
  disabled = false,
  flashResult,
  mode,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit(localValue);
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'simplified':
        return '输入简体字';
      case 'traditional':
        return '输入繁体字';
      default:
        return '输入字符';
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'simplified':
        return '请输入简体字';
      case 'traditional':
        return '请输入繁体字';
      default:
        return '请输入字符';
    }
  };

  const getFeedbackText = () => {
    if (isCorrect === true) {
      return '✓ 正确';
    }
    if (isCorrect === false) {
      return `✗ 错误，正确答案是: ${expectedCharacter}`;
    }
    return '';
  };

  return (
    <InputContainer>
      <InputLabel>{getLabel()}</InputLabel>
      <InputField
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        disabled={disabled}
        isCorrect={isCorrect}
        flashResult={flashResult || null}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <FeedbackText isCorrect={isCorrect}>
        {getFeedbackText()}
      </FeedbackText>
    </InputContainer>
  );
}; 
