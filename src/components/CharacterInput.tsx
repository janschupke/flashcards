import React, { useState, useEffect, forwardRef } from 'react';
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
    return '#4a5568';
  }};
  border-radius: 12px;
  background-color: #2d3748;
  color: #ffffff;
  transition: all 0.3s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: #718096;
    box-shadow: 0 0 0 3px rgba(113, 128, 150, 0.1);
  }
  
  &:disabled {
    background-color: #1a202c;
    color: #718096;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #718096;
  }
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

export const CharacterInput = forwardRef<HTMLInputElement, CharacterInputProps>(
  ({
    value,
    onChange,
    expectedCharacter,
    onSubmit,
    isCorrect,
    disabled = false,
    flashResult,
    mode,
  }, ref) => {
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
        <InputField
          ref={ref}
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
  }
);

CharacterInput.displayName = 'CharacterInput'; 
