import React, { useState, useCallback } from 'react';
import { PinyinInputProps } from '../types';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const Input = styled.input<{ $isCorrect: boolean | null }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.$isCorrect === null) return '#e9ecef';
    return props.$isCorrect ? '#28a745' : '#dc3545';
  }};
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 200px;
  text-align: center;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$isCorrect === null) return '#007bff';
      return props.$isCorrect ? '#28a745' : '#dc3545';
    }};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const FeedbackMessage = styled.div<{ $isCorrect: boolean | null }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => {
    if (props.$isCorrect === null) return '#6c757d';
    return props.$isCorrect ? '#28a745' : '#dc3545';
  }};
  min-height: 1.25rem;
  text-align: center;
`;

export const PinyinInput: React.FC<PinyinInputProps> = ({
  currentPinyin,
  onSubmit,
  isCorrect,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSubmit(value.trim());
  }, [onSubmit]);

  const getFeedbackMessage = () => {
    if (isCorrect === null) return '';
    if (isCorrect) return '✓ Correct!';
    return '✗ Incorrect. Try again.';
  };

  return (
    <InputContainer>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter pinyin..."
        $isCorrect={isCorrect}
        disabled={disabled}
        aria-label="Pinyin input"
        autoFocus
      />
      <FeedbackMessage $isCorrect={isCorrect} data-testid="feedback-message">
        {getFeedbackMessage()}
      </FeedbackMessage>
    </InputContainer>
  );
}; 
