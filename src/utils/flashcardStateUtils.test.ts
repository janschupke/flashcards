import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processAnswer,
  updateStorageAfterAnswer,
  calculateAdaptiveRangeExpansion,
  getNextCharacterIndex,
  createNextState,
} from './flashcardStateUtils';
import { Character, Answer, FlashCardState, HINT_TYPES, FlashcardMode } from '../types';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import * as storageUtils from './storageUtils';

// Mock dependencies
vi.mock('./flashcardUtils', () => ({
  evaluatePinyinAnswer: vi.fn((input: string) => {
    const trimmed = input.trim();
    return {
      isCorrect: trimmed === 'wǒ',
      hasInput: trimmed.length > 0,
    };
  }),
  createAnswer: vi.fn(
    (character: Character, input: string, index: number, isCorrect: boolean): Answer => ({
      characterIndex: index,
      submittedPinyin: input.trim() || '(empty)',
      correctPinyin: character.pinyin,
      simplified: character.simplified,
      traditional: character.traditional,
      english: character.english,
      isCorrect,
    })
  ),
}));

vi.mock('./storageUtils', () => ({
  saveAdaptiveRange: vi.fn(),
  getAllCharacterPerformance: vi.fn(() => []),
  saveHistory: vi.fn(),
  saveCounters: vi.fn(),
  savePreviousAnswer: vi.fn(),
  updateCharacterPerformance: vi.fn(),
}));

vi.mock('./adaptiveUtils', () => ({
  selectAdaptiveCharacter: vi.fn((characters: number[]) => characters[0] ?? 0),
}));

vi.mock('../data/characters.json', () => ({
  default: Array.from({ length: 200 }, (_, i) => ({
    item: String(i + 1),
    pinyin: `pinyin${i}`,
    english: `english${i}`,
    simplified: `simplified${i}`,
    traditional: `traditional${i}`,
  })),
}));

describe('flashcardStateUtils', () => {
  const mockCharacter: Character = {
    item: '1',
    pinyin: 'wǒ',
    english: 'I ; me',
    simplified: '我',
    traditional: '我',
  };

  const createMockAnswer = (index: number, isCorrect: boolean = true): Answer => ({
    characterIndex: index,
    submittedPinyin: isCorrect ? 'wǒ' : 'wo',
    correctPinyin: 'wǒ',
    simplified: '我',
    traditional: '我',
    english: 'I',
    isCorrect,
  });

  const createMockState = (allAnswers: Answer[] = []): FlashCardState => ({
    current: 0,
    limit: 100,
    hint: HINT_TYPES.NONE,
    totalSeen: 0,
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: 0,
    totalAttempted: 0,
    flashResult: null,
    previousCharacter: null,
    previousAnswer: null,
    incorrectAnswers: [],
    allAnswers,
    mode: FlashcardMode.BOTH,
    adaptiveRange: 100,
    recentAnswers: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processAnswer', () => {
    it('should process correct answer', () => {
      const result = processAnswer(mockCharacter, 'wǒ', 0);

      expect(result.isCorrect).toBe(true);
      expect(result.hasInput).toBe(true);
      expect(result.answer.isCorrect).toBe(true);
      expect(result.answer.characterIndex).toBe(0);
    });

    it('should process incorrect answer', () => {
      const result = processAnswer(mockCharacter, 'wo', 0);

      expect(result.isCorrect).toBe(false);
      expect(result.hasInput).toBe(true);
      expect(result.answer.isCorrect).toBe(false);
    });

    it('should handle empty input', () => {
      const result = processAnswer(mockCharacter, '', 0);

      expect(result.isCorrect).toBe(false);
      expect(result.hasInput).toBe(false);
      expect(result.answer.submittedPinyin).toBe('(empty)');
      expect(result.answer.isCorrect).toBe(false);
    });
  });

  describe('updateStorageAfterAnswer - Empty Answers', () => {
    it('should update character performance for empty answers', () => {
      const mockAnswer: Answer = {
        characterIndex: 0,
        submittedPinyin: '(empty)',
        correctPinyin: 'wǒ',
        simplified: '我',
        traditional: '我',
        english: 'I',
        isCorrect: false,
      };

      updateStorageAfterAnswer(
        0,
        false, // isCorrect
        0,
        1, // totalAttempted (should increment for empty)
        1,
        [mockAnswer],
        mockAnswer
      );

      // Should update character performance even for empty answers
      expect(storageUtils.updateCharacterPerformance).toHaveBeenCalledWith(0, false);
    });
  });

  describe('calculateAdaptiveRangeExpansion', () => {
    it('should not expand if not enough recent answers', () => {
      const recentAnswers = Array.from({ length: 5 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: 'test',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: true,
      }));

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(100);
      expect(result.shouldExpand).toBe(false);
    });

    it('should expand when success rate meets threshold', () => {
      const recentAnswers = Array.from({ length: 10 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: 'test',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: i < 8, // 8 correct, 2 incorrect = 80%
      }));

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(110);
      expect(result.shouldExpand).toBe(true);
    });

    it('should not expand when success rate below threshold', () => {
      const recentAnswers = Array.from({ length: 10 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: 'test',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: i < 7, // 7 correct, 3 incorrect = 70%
      }));

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(100);
      expect(result.shouldExpand).toBe(false);
    });

    it('should handle empty answers in recent window', () => {
      const recentAnswers = Array.from({ length: 10 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: i < 8 ? 'test' : '(empty)',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: i < 8, // 8 correct, 2 empty (counted as incorrect) = 80%
      }));

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(110);
      expect(result.shouldExpand).toBe(true);
    });

    it('should handle exactly 10 answers', () => {
      const recentAnswers = Array.from({ length: 10 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: 'test',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: true,
      }));

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(110);
      expect(result.shouldExpand).toBe(true);
    });

    it('should handle more than 10 answers (uses last 10)', () => {
      // Create 15 answers, but function should use last 10
      const allAnswers = Array.from({ length: 15 }, (_, i) => ({
        characterIndex: i,
        submittedPinyin: 'test',
        correctPinyin: 'test',
        simplified: '一',
        traditional: '一',
        english: 'one',
        isCorrect: i >= 5, // Last 10 are all correct (indices 5-14)
      }));
      // Pass only last 10 (as the function expects)
      const recentAnswers = allAnswers.slice(-10);

      const result = calculateAdaptiveRangeExpansion(recentAnswers, 100);

      expect(result.newAdaptiveRange).toBe(110);
      expect(result.shouldExpand).toBe(true);
    });
  });

  describe('getNextCharacterIndex', () => {
    it('should return character index within range', () => {
      const index = getNextCharacterIndex(2);

      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(2);
    });
  });

  describe('createNextState - History Trimming', () => {
    it('should trim allAnswers to MAX_HISTORY_ENTRIES', () => {
      const existingAnswers = Array.from({ length: 150 }, (_, i) => createMockAnswer(i));
      const prevState = createMockState(existingAnswers);
      const newAnswer = createMockAnswer(150);

      const newState = createNextState(
        prevState,
        newAnswer,
        true,
        true,
        10,
        10,
        10,
        [],
        [...existingAnswers, newAnswer],
        100,
        [newAnswer], // recentAnswers
        0
      );

      expect(newState.allAnswers).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
      // Should keep the last 100 entries (51-150)
      expect(newState.allAnswers[0]?.characterIndex).toBe(51);
      expect(newState.allAnswers[newState.allAnswers.length - 1]?.characterIndex).toBe(150);
    });

    it('should not trim when under limit', () => {
      const existingAnswers = Array.from({ length: 50 }, (_, i) => createMockAnswer(i));
      const prevState = createMockState(existingAnswers);
      const newAnswer = createMockAnswer(50);

      const newState = createNextState(
        prevState,
        newAnswer,
        true,
        true,
        10,
        10,
        10,
        [],
        [...existingAnswers, newAnswer],
        100,
        [newAnswer], // recentAnswers
        0
      );

      expect(newState.allAnswers).toHaveLength(51);
    });

    it('should trim incorrectAnswers to MAX_HISTORY_ENTRIES', () => {
      const incorrectAnswers = Array.from({ length: 150 }, (_, i) => createMockAnswer(i, false));
      const prevState = createMockState([]);
      const newAnswer = createMockAnswer(150, false);

      const newState = createNextState(
        prevState,
        newAnswer,
        false,
        true,
        10,
        10,
        10,
        [...incorrectAnswers, newAnswer],
        Array.from({ length: 151 }, (_, i) => createMockAnswer(i, false)),
        100,
        [newAnswer], // recentAnswers
        0
      );

      expect(newState.incorrectAnswers.length).toBeLessThanOrEqual(
        ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
      );
    });

    it('should preserve order when trimming (keep last N entries)', () => {
      const existingAnswers = Array.from({ length: 120 }, (_, i) => createMockAnswer(i));
      const prevState = createMockState(existingAnswers);
      const newAnswer = createMockAnswer(120);

      const newState = createNextState(
        prevState,
        newAnswer,
        true,
        true,
        10,
        10,
        10,
        [],
        [...existingAnswers, newAnswer],
        100,
        [newAnswer], // recentAnswers
        0
      );

      // Should keep entries 21-120 (last 100)
      expect(newState.allAnswers[0]?.characterIndex).toBe(21);
      expect(newState.allAnswers[newState.allAnswers.length - 1]?.characterIndex).toBe(120);
    });

    it('should handle exactly MAX_HISTORY_ENTRIES entries', () => {
      const existingAnswers = Array.from({ length: ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES }, (_, i) =>
        createMockAnswer(i)
      );
      const prevState = createMockState(existingAnswers);
      const newAnswer = createMockAnswer(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);

      const newState = createNextState(
        prevState,
        newAnswer,
        true,
        true,
        10,
        10,
        10,
        [],
        [...existingAnswers, newAnswer],
        100,
        [newAnswer], // recentAnswers
        0
      );

      // Should trim to exactly MAX_HISTORY_ENTRIES (remove first entry)
      expect(newState.allAnswers).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
      expect(newState.allAnswers[0]?.characterIndex).toBe(1); // First entry removed
      expect(newState.allAnswers[newState.allAnswers.length - 1]?.characterIndex).toBe(
        ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
      );
    });
  });
});
