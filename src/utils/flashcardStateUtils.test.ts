import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processAnswer,
  calculateAdaptiveRangeExpansion,
  getNextCharacterIndex,
  createNextState,
} from './flashcardStateUtils';
import { Character, Answer, FlashCardState, HINT_TYPES, FlashcardMode } from '../types';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';

// Mock dependencies
vi.mock('./flashcardUtils', () => ({
  evaluatePinyinAnswer: vi.fn((input: string) => {
    const trimmed = input.trim();
    return {
      isCorrect: trimmed === 'wǒ',
      hasInput: trimmed.length > 0,
    };
  }),
  createAnswer: vi.fn((character: Character, input: string, index: number, isCorrect: boolean): Answer => ({
    characterIndex: index,
    submittedPinyin: input.trim() || '(empty)',
    correctPinyin: character.pinyin,
    simplified: character.simplified,
    traditional: character.traditional,
    english: character.english,
    isCorrect,
  })),
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
  default: [
    { item: '1', pinyin: 'wǒ', english: 'I', simplified: '我', traditional: '我' },
    { item: '2', pinyin: 'hǎo', english: 'good', simplified: '好', traditional: '好' },
  ],
}), { virtual: true });

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
    answersSinceLastCheck: 0,
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
    });
  });

  describe('calculateAdaptiveRangeExpansion', () => {
    it('should not expand if not enough answers since last check', () => {
      const result = calculateAdaptiveRangeExpansion(5, 20, 16, 100);

      expect(result.newAdaptiveRange).toBe(100);
      expect(result.shouldExpand).toBe(false);
      expect(result.newAnswersSinceLastCheck).toBe(6);
    });

    it('should expand when success rate meets threshold', () => {
      const result = calculateAdaptiveRangeExpansion(10, 20, 16, 100);

      expect(result.newAdaptiveRange).toBe(110);
      expect(result.shouldExpand).toBe(true);
      expect(result.newAnswersSinceLastCheck).toBe(0);
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
      const existingAnswers = Array.from({ length: 150 }, (_, i) =>
        createMockAnswer(i)
      );
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
        0,
        0
      );

      expect(newState.allAnswers).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
      // Should keep the last 100 entries (51-150)
      expect(newState.allAnswers[0]?.characterIndex).toBe(51);
      expect(newState.allAnswers[newState.allAnswers.length - 1]?.characterIndex).toBe(150);
    });

    it('should not trim when under limit', () => {
      const existingAnswers = Array.from({ length: 50 }, (_, i) =>
        createMockAnswer(i)
      );
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
        0,
        0
      );

      expect(newState.allAnswers).toHaveLength(51);
    });

    it('should trim incorrectAnswers to MAX_HISTORY_ENTRIES', () => {
      const incorrectAnswers = Array.from({ length: 150 }, (_, i) =>
        createMockAnswer(i, false)
      );
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
        0,
        0
      );

      expect(newState.incorrectAnswers.length).toBeLessThanOrEqual(
        ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
      );
    });

    it('should preserve order when trimming (keep last N entries)', () => {
      const existingAnswers = Array.from({ length: 120 }, (_, i) =>
        createMockAnswer(i)
      );
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
        0,
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
        0,
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
