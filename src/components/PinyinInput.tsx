import React, { useState, useEffect, forwardRef } from 'react';
import { InputContainer, InputBorderWrapper, InputField, FeedbackText } from './styled';
import { PinyinInputProps } from '../types';
import { ANIMATION_TIMINGS, CHINESE_TEXT } from '../constants';

export const PinyinInput = forwardRef<HTMLInputElement, PinyinInputProps>(
  ({ value, onChange, currentPinyin, onSubmit, isCorrect, disabled = false, flashResult }, ref) => {
    const [isFlashing, setIsFlashing] = useState(false);

    // Handle flash result changes
    useEffect(() => {
      if (flashResult) {
        setIsFlashing(true);
        const timer = setTimeout(() => {
          setIsFlashing(false);
        }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
        return () => clearTimeout(timer);
      }
    }, [flashResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(value);
      }
    };

    const getPlaceholder = () => CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;

    const getFeedbackText = () => {
      if (isCorrect === true) {
        return CHINESE_TEXT.FEEDBACK.CORRECT;
      }
      if (isCorrect === false) {
        return CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(currentPinyin);
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
            value={value}
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
        <FeedbackText $isCorrect={isCorrect} data-testid="feedback-text">
          {getFeedbackText()}
        </FeedbackText>
      </InputContainer>
    );
  }
);

PinyinInput.displayName = 'PinyinInput'; 
