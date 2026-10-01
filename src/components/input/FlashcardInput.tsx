import React, { forwardRef, useId } from 'react';
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
 * Common flashcard input component logic for pinyin input
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
    const inputId = useId();
    const feedbackId = useId();
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
        <label htmlFor={inputId} className="sr-only">
          Pinyin for the character shown
        </label>
        {/* The input itself is outline-none and its border only ever showed
            correctness, so keyboard focus had no indicator at all. The ring
            sits on the wrapper, offset like the buttons' so it reads against
            a red error border too. */}
        <div
          className={`inline-block w-full max-w-full rounded-xl transition-colors bg-transparent border-2 focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 ${borderClass}`}
        >
          <input
            ref={ref}
            id={inputId}
            aria-describedby={feedbackId}
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
            className="w-full px-3 py-1.5 text-2xl text-center bg-transparent text-text-primary outline-none disabled:bg-surface-primary disabled:text-text-disabled disabled:cursor-not-allowed placeholder:text-text-tertiary"
          />
        </div>
        {/* Correctness was conveyed by colour alone to anything that cannot
            see the input. The text carries a check or cross glyph, so
            announcing it is enough. */}
        <div
          id={feedbackId}
          role="status"
          aria-live="polite"
          className={`mt-2 text-xs sm:text-sm font-medium min-h-5 ${feedbackClass}`}
          data-testid="feedback-text"
        >
          {feedbackText}
        </div>
      </div>
    );
  }
);

FlashcardInput.displayName = 'FlashcardInput';
