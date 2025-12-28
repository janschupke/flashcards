import { describe, it, expect } from 'vitest';
import { generateAnswerTableRows } from './tableUtils';
import { Answer, FlashcardMode } from '../types';

describe('tableUtils', () => {
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
    characterIndex: 1,
    submittedPinyin: '',
    correctPinyin: '',
    submittedCharacter: '好',
    correctCharacter: '好',
    simplified: '好',
    traditional: '好',
    english: 'good',
    mode: FlashcardMode.SIMPLIFIED,
    isCorrect: true,
  };

  describe('generateAnswerTableRows', () => {
    it('generates rows for pinyin-only answers', () => {
      const rows = generateAnswerTableRows([mockPinyinAnswer], false);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveLength(5);
      // Check that pinyin column is present
      expect(rows[0]?.[2]).toBeDefined();
    });

    it('generates rows for character mode answers', () => {
      const rows = generateAnswerTableRows([mockCharacterAnswer], true);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveLength(5);
      // Check that correct character column is present
      expect(rows[0]?.[2]).toBeDefined();
    });

    it('generates rows for mixed answers with character modes', () => {
      const rows = generateAnswerTableRows([mockPinyinAnswer, mockCharacterAnswer], true);

      expect(rows).toHaveLength(2);
      rows.forEach((row) => {
        expect(row).toHaveLength(5);
      });
    });

    it('applies correct color class to submitted column', () => {
      const correctAnswer: Answer = { ...mockPinyinAnswer, isCorrect: true };
      const incorrectAnswer: Answer = { ...mockPinyinAnswer, isCorrect: false, submittedPinyin: 'wrong' };

      const rows = generateAnswerTableRows([correctAnswer, incorrectAnswer], false);

      // Check that submitted column has correct styling
      const correctRow = rows[0];
      const incorrectRow = rows[1];

      expect(correctRow?.[3]).toBeDefined();
      expect(incorrectRow?.[3]).toBeDefined();
    });

    it('handles empty answers array', () => {
      const rows = generateAnswerTableRows([], false);
      expect(rows).toHaveLength(0);
    });
  });
});

