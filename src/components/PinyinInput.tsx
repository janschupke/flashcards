import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PinyinInputProps } from '../types';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const PinyinStyledInput = styled.input`
  width: 100%;
  max-width: 200px;
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
  background: #2d3748;
  color: #ffffff;
  
  &:focus {
    border-color: #4a5568;
    box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
  }
  
  &::placeholder {
    color: #718096;
  }

  &.flash-correct {
    border-color: #28a745;
    animation: flashGreen 1s ease-out;
  }

  &.flash-incorrect {
    border-color: #dc3545;
    animation: flashRed 1s ease-out;
  }

  @keyframes flashGreen {
    0%, 100% { border-color: #4a5568; }
    50% { border-color: #28a745; }
  }

  @keyframes flashRed {
    0%, 100% { border-color: #4a5568; }
    50% { border-color: #dc3545; }
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
  currentIndex,
  onSubmit,
  isCorrect,
  disabled = false,
  flashResult = null,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Clear input when character changes (currentPinyin changes)
  useEffect(() => {
    setInputValue('');
  }, [currentIndex]);

  // Handle flash animation
  useEffect(() => {
    if (flashResult && inputRef.current) {
      const className = flashResult === 'correct' ? 'flash-correct' : 'flash-incorrect';
      inputRef.current.classList.add(className);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.classList.remove(className);
        }
      }, 1000);
    }
  }, [flashResult]);

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
      <PinyinStyledInput
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter pinyin..."
        disabled={disabled}
        aria-label="Pinyin input"
        autoComplete="off"
      />
      <FeedbackMessage $isCorrect={isCorrect} data-testid="feedback-message">
        {getFeedbackMessage()}
      </FeedbackMessage>
    </InputContainer>
  );
}; 
