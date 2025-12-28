import { forwardRef } from 'react';
import { CharacterInputProps } from '../../types';
import { FlashcardInput } from './FlashcardInput';
import { getPlaceholder } from '../../utils/inputUtils';
import { getCharacterFeedbackText } from '../../utils/feedbackUtils';

export const CharacterInput = forwardRef<HTMLInputElement, CharacterInputProps>(
  (
    {
      value,
      onChange,
      expectedCharacter,
      onSubmit,
      isCorrect,
      disabled = false,
      flashResult,
      mode,
    },
    ref
  ) => {
    const placeholder = getPlaceholder(mode);
    const feedbackText = getCharacterFeedbackText(isCorrect, expectedCharacter);

    return (
      <FlashcardInput
        ref={ref}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        feedbackText={feedbackText}
        isCorrect={isCorrect}
        flashResult={flashResult ?? null}
        disabled={disabled}
      />
    );
  }
);

CharacterInput.displayName = 'CharacterInput';
