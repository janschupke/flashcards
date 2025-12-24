import React, { useState, useEffect, forwardRef } from 'react';
import { CharacterInputProps } from '../../types';
import { ANIMATION_TIMINGS, CHINESE_TEXT } from '../../constants';

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

    const getPlaceholder = () => {
      switch (mode) {
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
        return CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER(expectedCharacter);
      }
      return '';
    };

    const borderColor = ((flash: typeof flashResult, correct: typeof isCorrect) => {
      if (flash) {
        return flash === 'correct' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)';
      }
      if (correct === true) return 'rgb(16, 185, 129)';
      if (correct === false) return 'rgb(239, 68, 68)';
      return 'rgb(74, 85, 104)';
    })(flashResult, isCorrect);

    return (
      <div className="m-0 text-center">
        <div style={{ borderColor }} className={`inline-block w-full max-w-full sm:max-w-md rounded-xl transition-colors bg-secondary-dark border-2 ${
          isFlashing ? (flashResult === 'correct' ? 'border-emerald-500' : 'border-rose-500')
          : (isCorrect === true ? 'border-emerald-500' : isCorrect === false ? 'border-rose-500' : 'border-secondary')
        }`}>
          <input
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
            className="w-full px-5 py-4 text-2xl text-center bg-transparent text-white outline-none disabled:bg-background-primary disabled:text-secondary-light disabled:cursor-not-allowed placeholder:text-secondary-light"
          />
        </div>
        <div className={`mt-2 text-sm font-medium min-h-[20px] ${isCorrect === true ? 'text-emerald-500' : isCorrect === false ? 'text-rose-500' : 'text-gray-500'}`} data-testid="feedback-text">
          {getFeedbackText()}
        </div>
      </div>
    );
  }
);

CharacterInput.displayName = 'CharacterInput'; 
