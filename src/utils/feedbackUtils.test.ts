import { describe, it, expect } from 'vitest';
import { getPinyinFeedbackText } from './feedbackUtils';
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
});
