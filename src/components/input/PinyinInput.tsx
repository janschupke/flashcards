import { forwardRef } from 'react';
import { PinyinInputProps } from '../../types';
import { CHINESE_TEXT } from '../../constants';
import { FlashcardInput } from './FlashcardInput';
import { getPinyinFeedbackText } from '../../utils/feedbackUtils';

export const PinyinInput = forwardRef<HTMLInputElement, PinyinInputProps>(
  ({ value, onChange, currentPinyin, onSubmit, isCorrect, disabled = false, flashResult }, ref) => {
    const placeholder = CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;
    const feedbackText = getPinyinFeedbackText(isCorrect, currentPinyin);

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

PinyinInput.displayName = 'PinyinInput';
