import React, { forwardRef } from 'react';
import { FlashResult } from '../../types';
import { useFlashAnimation } from '../../hooks/useFlashAnimation';
import { useInputVariant } from '../../hooks/useInputVariant';

interface FlashcardInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  feedbackText: string;
  isCorrect: boolean | null;
  flashResult: FlashResult | null;
  disabled?: boolean;
}

/**
 * Unified flashcard input component that handles both pinyin and character inputs
 * Extracted common logic from PinyinInput and CharacterInput
 */
export const FlashcardInput = forwardRef<HTMLInputElement, FlashcardInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder,
      feedbackText,
      isCorrect,
      flashResult,
      disabled = false,
    },
    ref
  ) => {
    const isFlashing = useFlashAnimation(flashResult);
    const { borderClass, feedbackClass } = useInputVariant(isFlashing, flashResult, isCorrect);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(value);
      }
    };

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
            placeholder={placeholder}
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
          {feedbackText}
        </div>
      </div>
    );
  }
);

FlashcardInput.displayName = 'FlashcardInput';
