import React, { forwardRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { CHINESE_TEXT } from '../../constants';
import { FlashResult } from '../../types';

interface FlashcardInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isCorrect: boolean | null;
  disabled?: boolean;
  flashResult?: FlashResult | null;
  mode: 'pinyin' | 'simplified' | 'traditional';
  expectedValue: string;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const InputBorderWrapper = styled.div<{
  $isCorrect: boolean | null;
  $flashResult: FlashResult | null;
  $isFlashing: boolean;
}>`
  position: relative;
  border-radius: ${theme.borderRadius.md};
  padding: 2px;
  background: ${props => {
    if (props.$isFlashing) {
      return props.$flashResult === FlashResult.CORRECT 
        ? `linear-gradient(135deg, ${theme.colors.feedback.success}, ${theme.colors.feedback.success}88)`
        : `linear-gradient(135deg, ${theme.colors.feedback.error}, ${theme.colors.feedback.error}88)`;
    }
    if (props.$isCorrect === true) {
      return `linear-gradient(135deg, ${theme.colors.feedback.success}, ${theme.colors.feedback.success}88)`;
    }
    if (props.$isCorrect === false) {
      return `linear-gradient(135deg, ${theme.colors.feedback.error}, ${theme.colors.feedback.error}88)`;
    }
    return `linear-gradient(135deg, ${theme.colors.border.primary}, ${theme.colors.border.secondary})`;
  }};
  transition: all 0.3s ease;
`;

const InputField = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.background.card};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:focus {
    box-shadow: ${theme.shadows.focus};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FeedbackText = styled.div<{ isCorrect: boolean | null }>`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => {
    if (props.isCorrect === true) return theme.colors.feedback.success;
    if (props.isCorrect === false) return theme.colors.feedback.error;
    return theme.colors.text.muted;
  }};
  min-height: ${theme.typography.fontSize.sm};
  transition: color 0.3s ease;
`;

export const FlashcardInput = forwardRef<HTMLInputElement, FlashcardInputProps>(
  ({
    value,
    onChange,
    onSubmit,
    isCorrect,
    disabled = false,
    flashResult,
    mode,
    expectedValue,
  }, ref) => {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
      if (flashResult) {
        setIsFlashing(true);
        const timer = setTimeout(() => {
          setIsFlashing(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [flashResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(value);
      }
    };

    const getPlaceholder = () => {
      switch (mode) {
        case 'pinyin':
          return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;
        case 'simplified':
          return CHINESE_TEXT.MODES.SIMPLIFIED.PLACEHOLDER;
        case 'traditional':
          return CHINESE_TEXT.MODES.TRADITIONAL.PLACEHOLDER;
        default:
          return '输入字符';
      }
    };

    const getFeedbackText = () => {
      if (isCorrect === true) {
        return CHINESE_TEXT.FEEDBACK.CORRECT;
      }
      if (isCorrect === false) {
        return mode === 'pinyin' 
          ? CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(expectedValue)
          : CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER(expectedValue);
      }
      return '';
    };

    return (
      <InputContainer>
        <InputBorderWrapper
          $isCorrect={isCorrect}
          $flashResult={flashResult || null}
          $isFlashing={isFlashing}
        >
          <InputField
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled}
            data-testid={`${mode}-input`}
          />
        </InputBorderWrapper>
        <FeedbackText isCorrect={isCorrect}>
          {getFeedbackText()}
        </FeedbackText>
      </InputContainer>
    );
  }
); 
