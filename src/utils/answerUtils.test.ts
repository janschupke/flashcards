import { describe, it, expect } from 'vitest';
import { getSubmittedText, getCorrectText } from './answerUtils';
import { Answer, FlashcardMode } from '../types';

describe('answerUtils', () => {
  const mockPinyinAnswer: Answer = {
    characterIndex: 0,
    submittedPinyin: 'ni3',
    correctPinyin: 'nǐ',
    simplified: '你',
    traditional: '你',
    english: 'you',
    mode: FlashcardMode.PINYIN,
    isCorrect: true,
  };

  const mockCharacterAnswer: Answer = {
    characterIndex: 0,
    submittedPinyin: '',
    correctPinyin: '',
    submittedCharacter: '你',
    correctCharacter: '你',
    simplified: '你',
    traditional: '你',
    english: 'you',
    mode: FlashcardMode.SIMPLIFIED,
    isCorrect: true,
  };

  describe('getSubmittedText', () => {
    it('returns submittedPinyin for PINYIN mode', () => {
      expect(getSubmittedText(mockPinyinAnswer)).toBe('ni3');
    });

    it('returns submittedCharacter for SIMPLIFIED mode', () => {
      expect(getSubmittedText(mockCharacterAnswer)).toBe('你');
    });

    it('returns submittedCharacter for TRADITIONAL mode', () => {
      const traditionalAnswer: Answer = {
        ...mockCharacterAnswer,
        mode: FlashcardMode.TRADITIONAL,
      };
      expect(getSubmittedText(traditionalAnswer)).toBe('你');
    });

    it('returns "(empty)" when submittedPinyin is empty in PINYIN mode', () => {
      const emptyAnswer: Answer = {
        ...mockPinyinAnswer,
        submittedPinyin: '',
      };
      expect(getSubmittedText(emptyAnswer)).toBe('(empty)');
    });

    it('returns "(empty)" when submittedCharacter is empty in character mode', () => {
      const emptyAnswer: Answer = {
        ...mockCharacterAnswer,
        submittedCharacter: '',
      };
      expect(getSubmittedText(emptyAnswer)).toBe('(empty)');
    });
  });

  describe('getCorrectText', () => {
    it('returns correctPinyin for PINYIN mode', () => {
      expect(getCorrectText(mockPinyinAnswer)).toBe('nǐ');
    });

    it('returns correctCharacter for SIMPLIFIED mode', () => {
      expect(getCorrectText(mockCharacterAnswer)).toBe('你');
    });

    it('returns correctCharacter for TRADITIONAL mode', () => {
      const traditionalAnswer: Answer = {
        ...mockCharacterAnswer,
        mode: FlashcardMode.TRADITIONAL,
        correctCharacter: '妳',
      };
      expect(getCorrectText(traditionalAnswer)).toBe('妳');
    });

    it('returns empty string when correctCharacter is undefined', () => {
      const answerWithoutCharacter: Answer = {
        ...mockCharacterAnswer,
        correctCharacter: undefined,
      };
      expect(getCorrectText(answerWithoutCharacter)).toBe('');
    });
  });
});

