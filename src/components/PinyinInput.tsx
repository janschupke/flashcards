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

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Input = styled.input<{ isCorrect: boolean | null }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.isCorrect === null) return '#e9ecef';
    return props.isCorrect ? '#28a745' : '#dc3545';
  }};
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 200px;
  text-align: center;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const FeedbackMessage = styled.div<{ isCorrect: boolean | null }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => {
    if (props.isCorrect === null) return '#6c757d';
    return props.isCorrect ? '#28a745' : '#dc3545';
  }};
  min-height: 1.25rem;
  text-align: center;
`;

const Instructions = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 0.5rem;
`;

export const PinyinInput: React.FC<PinyinInputProps> = ({
  currentPinyin,
  onSubmit,
  isCorrect,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  }, [inputValue, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, disabled]);

  const getFeedbackMessage = () => {
    if (isCorrect === null) return 'Enter the pinyin for this character';
    if (isCorrect) return '✓ Correct!';
    return '✗ Incorrect. Try again.';
  };

  return (
    <InputContainer>
      <Instructions>
        Type the pinyin (tones optional): {currentPinyin}
      </Instructions>
      <InputGroup>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter pinyin..."
          isCorrect={isCorrect}
          disabled={disabled}
          aria-label="Pinyin input"
        />
        <SubmitButton
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          aria-label="Submit pinyin"
        >
          Submit
        </SubmitButton>
      </InputGroup>
      <FeedbackMessage isCorrect={isCorrect}>
        {getFeedbackMessage()}
      </FeedbackMessage>
    </InputContainer>
  );
}; 
