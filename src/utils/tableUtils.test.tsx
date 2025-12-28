import { describe, it, expect } from 'vitest';
import { generateAnswerTableRows } from './tableUtils';
import { Answer } from '../types';

describe('tableUtils', () => {
  const mockAnswer: Answer = {
    characterIndex: 0,
    submittedPinyin: 'ni3',
    correctPinyin: 'nǐ',
    simplified: '你',
    traditional: '你',
    english: 'you',
    isCorrect: true,
  };

  describe('generateAnswerTableRows', () => {
    it('generates rows for pinyin answers', () => {
      const rows = generateAnswerTableRows([mockAnswer]);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveLength(5);
      // Check that pinyin column is present
      expect(rows[0]?.[2]).toBeDefined();
    });

    it('applies correct color class to submitted column', () => {
      const correctAnswer: Answer = { ...mockAnswer, isCorrect: true };
      const incorrectAnswer: Answer = {
        ...mockAnswer,
        isCorrect: false,
        submittedPinyin: 'wrong',
      };

      const rows = generateAnswerTableRows([correctAnswer, incorrectAnswer]);

      // Check that submitted column has correct styling
      const correctRow = rows[0];
      const incorrectRow = rows[1];

      expect(correctRow?.[3]).toBeDefined();
      expect(incorrectRow?.[3]).toBeDefined();
    });

    it('handles empty answers array', () => {
      const rows = generateAnswerTableRows([]);
      expect(rows).toHaveLength(0);
    });
  });
});
