import { describe, it, expect, beforeEach } from 'vitest';
import { saveHistory, loadHistory } from './storageUtils';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { Answer } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storageUtils - History', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const createMockAnswer = (index: number, isCorrect: boolean = true): Answer => ({
    characterIndex: index,
    submittedPinyin: isCorrect ? 'wǒ' : 'wo',
    correctPinyin: 'wǒ',
    simplified: '我',
    traditional: '我',
    english: 'I',
    isCorrect,
  });

  describe('saveHistory', () => {
    it('should save history to localStorage', () => {
      const answers: Answer[] = [createMockAnswer(0), createMockAnswer(1), createMockAnswer(2)];

      saveHistory(answers);

      const saved = loadHistory();
      expect(saved).toHaveLength(3);
      expect(saved).toEqual(answers);
    });

    it('should trim history to MAX_HISTORY_ENTRIES when saving', () => {
      const answers: Answer[] = Array.from({ length: 150 }, (_, i) => createMockAnswer(i));

      saveHistory(answers);

      const saved = loadHistory();
      expect(saved).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
      // Should keep the last 100 entries
      expect(saved[0]?.characterIndex).toBe(50); // First entry should be index 50 (150 - 100)
      expect(saved[saved.length - 1]?.characterIndex).toBe(149); // Last entry should be index 149
    });

    it('should keep exactly MAX_HISTORY_ENTRIES when array exceeds limit', () => {
      const answers: Answer[] = Array.from({ length: 200 }, (_, i) => createMockAnswer(i));

      saveHistory(answers);

      const saved = loadHistory();
      expect(saved).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
    });

    it('should keep all entries when under limit', () => {
      const answers: Answer[] = Array.from({ length: 50 }, (_, i) => createMockAnswer(i));

      saveHistory(answers);

      const saved = loadHistory();
      expect(saved).toHaveLength(50);
    });

    it('should handle empty array', () => {
      saveHistory([]);

      const saved = loadHistory();
      expect(saved).toHaveLength(0);
    });

    it('should preserve answer order (keep last N entries)', () => {
      const answers: Answer[] = Array.from({ length: 120 }, (_, i) => createMockAnswer(i));

      saveHistory(answers);

      const saved = loadHistory();
      // Should keep entries 20-119 (last 100)
      expect(saved[0]?.characterIndex).toBe(20);
      expect(saved[1]?.characterIndex).toBe(21);
      expect(saved[saved.length - 1]?.characterIndex).toBe(119);
    });
  });

  describe('loadHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = loadHistory();
      expect(history).toEqual([]);
    });

    it('should load saved history', () => {
      const answers: Answer[] = [createMockAnswer(0), createMockAnswer(1), createMockAnswer(2)];

      saveHistory(answers);
      const loaded = loadHistory();

      expect(loaded).toHaveLength(3);
      expect(loaded).toEqual(answers);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Simulate corrupted data
      window.localStorage.setItem('flashcard-history', 'invalid json');

      const history = loadHistory();
      expect(history).toEqual([]);
    });
  });

  describe('History trimming integration', () => {
    it('should maintain MAX_HISTORY_ENTRIES limit across multiple saves', () => {
      // First save: 50 entries
      const firstBatch: Answer[] = Array.from({ length: 50 }, (_, i) => createMockAnswer(i));
      saveHistory(firstBatch);
      expect(loadHistory()).toHaveLength(50);

      // Second save: add 60 more (total would be 110, but should be trimmed to 100)
      const secondBatch: Answer[] = Array.from({ length: 60 }, (_, i) => createMockAnswer(50 + i));
      const combined = [...firstBatch, ...secondBatch];
      saveHistory(combined);
      const saved = loadHistory();

      expect(saved).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
      // Should keep the last 100 entries (10 from first batch + all 60 from second batch)
      expect(saved[0]?.characterIndex).toBe(10);
      expect(saved[saved.length - 1]?.characterIndex).toBe(109);
    });
  });
});
