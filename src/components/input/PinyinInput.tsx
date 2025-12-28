import React, { useState, useEffect, forwardRef } from 'react';
import { PinyinInputProps, FlashResult } from '../../types';
import { ANIMATION_TIMINGS, CHINESE_TEXT } from '../../constants';
import { InputVariant } from '../../types/components';

export const PinyinInput = forwardRef<HTMLInputElement, PinyinInputProps>(
  ({ value, onChange, currentPinyin, onSubmit, isCorrect, disabled = false, flashResult }, ref) => {
    const [isFlashing, setIsFlashing] = useState(false);

    // Handle flash result changes
    useEffect(() => {
      if (flashResult !== null && flashResult !== undefined) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsFlashing(true);
        const timer = setTimeout(() => {
          setIsFlashing(false);
        }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [flashResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(value);
      }
    };

    const getPlaceholder = (): string => CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;

    const getFeedbackText = (): string => {
      if (isCorrect === true) {
        return CHINESE_TEXT.FEEDBACK.CORRECT;
      }
      if (isCorrect === false) {
        return CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(currentPinyin);
      }
      return '';
    };

    const getVariant = (): InputVariant => {
      if (isFlashing) {
        return flashResult === FlashResult.CORRECT ? InputVariant.SUCCESS : InputVariant.ERROR;
      }
      if (isCorrect === true) return InputVariant.SUCCESS;
      if (isCorrect === false) return InputVariant.ERROR;
      return InputVariant.DEFAULT;
    };

    const variant = getVariant();
    const borderClass =
      variant === InputVariant.SUCCESS
        ? 'border-success'
        : variant === InputVariant.ERROR
          ? 'border-error'
          : 'border-border-secondary';

    const feedbackClass =
      variant === InputVariant.SUCCESS
        ? 'text-success'
        : variant === InputVariant.ERROR
          ? 'text-error'
          : 'text-text-tertiary';

    return (
      <div className="m-0 text-center">
        <div
          className={`inline-block w-full max-w-full sm:max-w-md rounded-xl transition-colors bg-surface-secondary border-2 ${borderClass}`}
        >
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
            className="w-full px-3 py-1.5 text-xl sm:text-2xl text-center bg-transparent text-text-primary outline-none disabled:bg-surface-primary disabled:text-text-disabled disabled:cursor-not-allowed placeholder:text-text-tertiary"
          />
        </div>
        <div
          className={`mt-2 text-xs sm:text-sm font-medium min-h-[20px] ${feedbackClass}`}
          data-testid="feedback-text"
        >
          {getFeedbackText()}
        </div>
      </div>
    );
  }
);

PinyinInput.displayName = 'PinyinInput';
