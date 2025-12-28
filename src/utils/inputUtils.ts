import { FlashcardMode } from '../types';
import { CHINESE_TEXT } from '../constants';

/**
 * Gets the placeholder text for an input based on flashcard mode
 * @param mode - The current flashcard mode
 * @returns Placeholder string
 */
export const getPlaceholder = (mode: FlashcardMode): string => {
  switch (mode) {
    case FlashcardMode.BOTH:
      return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER; // Use pinyin placeholder for both mode
    case FlashcardMode.SIMPLIFIED:
      return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER; // Always pinyin input
    case FlashcardMode.TRADITIONAL:
      return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER; // Always pinyin input
    default:
      return '输入拼音';
  }
};
