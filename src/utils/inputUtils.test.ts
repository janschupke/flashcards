import { describe, it, expect } from 'vitest';
import { getPlaceholder } from './inputUtils';
import { FlashcardMode } from '../types';
import { CHINESE_TEXT } from '../constants';

describe('inputUtils', () => {
  describe('getPlaceholder', () => {
    it('returns pinyin placeholder for BOTH mode', () => {
      expect(getPlaceholder(FlashcardMode.BOTH)).toBe(CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER);
    });

    it('returns pinyin placeholder for SIMPLIFIED mode', () => {
      expect(getPlaceholder(FlashcardMode.SIMPLIFIED)).toBe(CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER);
    });

    it('returns pinyin placeholder for TRADITIONAL mode', () => {
      expect(getPlaceholder(FlashcardMode.TRADITIONAL)).toBe(CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER);
    });
  });
});
