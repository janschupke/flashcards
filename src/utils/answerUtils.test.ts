import { describe, it, expect } from 'vitest';
import { getSubmittedText, getCorrectText } from './answerUtils';
import { Answer } from '../types';

describe('answerUtils', () => {
  const mockAnswer: Answer = {
    characterIndex: 0,
    submittedPinyin: 'ni3',
    correctPinyin: 'nǐ',
    simplified: '你',
    traditional: '你',
    english: 'you',
    isCorrect: true,
  };

  describe('getSubmittedText', () => {
    it('returns submittedPinyin', () => {
      expect(getSubmittedText(mockAnswer)).toBe('ni3');
    });

    it('returns "(empty)" when submittedPinyin is empty', () => {
      const emptyAnswer: Answer = {
        ...mockAnswer,
        submittedPinyin: '',
      };
      expect(getSubmittedText(emptyAnswer)).toBe('(empty)');
    });

    it('returns "(empty)" when submittedPinyin is whitespace only', () => {
      const emptyAnswer: Answer = {
        ...mockAnswer,
        submittedPinyin: '   ',
      };
      expect(getSubmittedText(emptyAnswer)).toBe('(empty)');
    });
  });

  describe('getCorrectText', () => {
    it('returns correctPinyin', () => {
      expect(getCorrectText(mockAnswer)).toBe('nǐ');
    });
  });
});
