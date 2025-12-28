import { describe, it, expect } from 'vitest';
import { getPinyinFeedbackText, getCharacterFeedbackText } from './feedbackUtils';
import { CHINESE_TEXT } from '../constants';

describe('feedbackUtils', () => {
  describe('getPinyinFeedbackText', () => {
    it('returns correct message when isCorrect is true', () => {
      expect(getPinyinFeedbackText(true, 'nǐ')).toBe(CHINESE_TEXT.FEEDBACK.CORRECT);
    });

    it('returns incorrect message when isCorrect is false', () => {
      const result = getPinyinFeedbackText(false, 'nǐ');
      expect(result).toBe(CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN('nǐ'));
    });

    it('returns empty string when isCorrect is null', () => {
      expect(getPinyinFeedbackText(null, 'nǐ')).toBe('');
    });
  });

  describe('getCharacterFeedbackText', () => {
    it('returns correct message when isCorrect is true', () => {
      expect(getCharacterFeedbackText(true, '你')).toBe(CHINESE_TEXT.FEEDBACK.CORRECT);
    });

    it('returns incorrect message when isCorrect is false', () => {
      const result = getCharacterFeedbackText(false, '你');
      expect(result).toBe(CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER('你'));
    });

    it('returns empty string when isCorrect is null', () => {
      expect(getCharacterFeedbackText(null, '你')).toBe('');
    });
  });
});
