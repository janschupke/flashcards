import { FlashcardMode } from '../types';
import { CHINESE_TEXT } from '../constants';

/**
 * Gets the placeholder text for an input based on flashcard mode
 * @param mode - The current flashcard mode
 * @returns Placeholder string
 */
export const getPlaceholder = (mode: FlashcardMode): string => {
  switch (mode) {
    case FlashcardMode.PINYIN:
      return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;
    case FlashcardMode.SIMPLIFIED:
      return CHINESE_TEXT.MODES.SIMPLIFIED.PLACEHOLDER;
    case FlashcardMode.TRADITIONAL:
      return CHINESE_TEXT.MODES.TRADITIONAL.PLACEHOLDER;
    default:
      return '输入字符';
  }
};

