import { describe, it, expect } from 'vitest';
import { transformAnswerToRow } from './tableUtils';
import { Answer } from '../types';

describe('tableUtils', () => {
  describe('transformAnswerToRow', () => {
    const mockAnswer: Answer = {
      characterIndex: 0,
      submittedPinyin: 'wǒ',
      correctPinyin: 'wǒ',
      simplified: '我',
      traditional: '我',
      english: 'I ; me',
      isCorrect: true,
    };

    it('should transform correct answer to row', () => {
      const result = transformAnswerToRow(mockAnswer);

      expect(result.simplified).toBe('我');
      expect(result.traditional).toBe('我');
      expect(result.expected).toBe('wǒ');
      expect(result.submitted).toBe('wǒ');
      expect(result.english).toBe('I ; me');
      expect(result.submittedClass).toBe('text-success');
    });

    it('should transform incorrect answer to row', () => {
      const incorrectAnswer: Answer = {
        ...mockAnswer,
        submittedPinyin: 'wo',
        isCorrect: false,
      };

      const result = transformAnswerToRow(incorrectAnswer);

      expect(result.submitted).toBe('wo');
      expect(result.expected).toBe('wǒ');
      expect(result.submittedClass).toBe('text-error');
    });

    it('should handle empty submitted pinyin', () => {
      const emptyAnswer: Answer = {
        ...mockAnswer,
        submittedPinyin: '(empty)',
        isCorrect: false,
      };

      const result = transformAnswerToRow(emptyAnswer);

      expect(result.submitted).toBe('(empty)');
      expect(result.submittedClass).toBe('text-error');
    });

    it('should preserve all character data', () => {
      const result = transformAnswerToRow(mockAnswer);

      expect(result.simplified).toBe(mockAnswer.simplified);
      expect(result.traditional).toBe(mockAnswer.traditional);
      expect(result.english).toBe(mockAnswer.english);
    });
  });
});


