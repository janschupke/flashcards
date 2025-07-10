import React, { useState, useEffect, forwardRef } from 'react';
import { InputContainer, InputBorderWrapper, InputField, FeedbackText } from './styled';
import { PinyinInputProps } from '../types';

export const PinyinInput = forwardRef<HTMLInputElement, PinyinInputProps>(
  ({ value, onChange, currentPinyin, onSubmit, isCorrect, disabled = false, flashResult }, ref) => {
    const [localValue, setLocalValue] = useState(value);
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Handle flash result changes
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
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(localValue);
      }
    };

    const getPlaceholder = () => 'Type pinyin';

    const getFeedbackText = () => {
      if (isCorrect === true) {
        return '✓ 正确';
      }
      if (isCorrect === false) {
        return `✗ 错误，正确答案是: ${currentPinyin}`;
      }
      return '';
    };

    return (
      <InputContainer>
        <InputBorderWrapper
          $isCorrect={isFlashing ? null : isCorrect}
          $flashResult={flashResult || null}
          $isFlashing={isFlashing}
        >
          <InputField
            ref={ref}
            type="text"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </InputBorderWrapper>
        <FeedbackText isCorrect={isCorrect} data-testid="feedback-text">
          {getFeedbackText()}
        </FeedbackText>
      </InputContainer>
    );
  }
);

PinyinInput.displayName = 'PinyinInput'; 
