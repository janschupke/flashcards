import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlashCard } from './useFlashCard';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { Answer } from '../types';
import * as storageUtils from '../utils/storageUtils';
import * as flashcardUtils from '../utils/flashcardUtils';

// Mock dependencies
vi.mock('../utils/storageUtils', () => ({
  loadHistory: vi.fn(() => []),
  loadCounters: vi.fn(() => null),
  loadPreviousAnswer: vi.fn(() => null),
  loadAdaptiveRange: vi.fn(() => null),
  loadMode: vi.fn(() => null),
  saveHistory: vi.fn(),
  saveCounters: vi.fn(),
  savePreviousAnswer: vi.fn(),
  saveAdaptiveRange: vi.fn(),
  saveMode: vi.fn(),
  updateCharacterPerformance: vi.fn(),
  getAllCharacterPerformance: vi.fn(() => []),
}));

vi.mock('../utils/flashcardUtils', () => ({
  evaluatePinyinAnswer: vi.fn(() => ({ isCorrect: true, hasInput: true })),
  createAnswer: vi.fn(
    (
      char: { pinyin: string; simplified: string; traditional: string; english: string },
      input: string,
      index: number,
      isCorrect: boolean
    ) => ({
      characterIndex: index,
      submittedPinyin: input,
      correctPinyin: char.pinyin,
      simplified: char.simplified,
      traditional: char.traditional,
      english: char.english,
      isCorrect,
    })
  ),
}));

vi.mock('../utils/adaptiveUtils', () => ({
  selectAdaptiveCharacter: vi.fn(() => 0),
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

describe('useFlashCard - History Trimming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockAnswer = (index: number): Answer => ({
    characterIndex: index,
    submittedPinyin: 'wǒ',
    correctPinyin: 'wǒ',
    simplified: '我',
    traditional: '我',
    english: 'I',
    isCorrect: true,
  });

  it('should trim history when loaded history exceeds MAX_HISTORY_ENTRIES', () => {
    const largeHistory = Array.from({ length: 150 }, (_, i) => createMockAnswer(i));
    vi.mocked(storageUtils.loadHistory).mockReturnValue(largeHistory);

    const { result } = renderHook(() => useFlashCard());

    expect(result.current.allAnswers).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
    // Should keep last 100 entries (50-149)
    expect(result.current.allAnswers[0]?.characterIndex).toBe(50);
    expect(result.current.allAnswers[result.current.allAnswers.length - 1]?.characterIndex).toBe(
      149
    );
  });

  it('should increment totalAttempted for empty answers', () => {
    const { result } = renderHook(() => useFlashCard());

    // Mock empty answer
    vi.mocked(flashcardUtils.evaluatePinyinAnswer).mockReturnValue({
      isCorrect: false,
      hasInput: false,
    });

    act(() => {
      result.current.setPinyinInput('');
      result.current.getNext();
    });

    expect(result.current.totalAttempted).toBe(1);
  });

  it('should maintain recent answers window', () => {
    const { result } = renderHook(() => useFlashCard());

    // Submit 15 answers
    for (let i = 0; i < 15; i++) {
      act(() => {
        result.current.setPinyinInput('test');
        result.current.getNext();
      });
    }

    // Should only keep last 10
    expect(result.current.recentAnswers).toHaveLength(10);
  });

  it('should reset recent answers after expansion', () => {
    const { result } = renderHook(() => useFlashCard());

    // Submit 10 correct answers to trigger expansion
    vi.mocked(flashcardUtils.evaluatePinyinAnswer).mockReturnValue({
      isCorrect: true,
      hasInput: true,
    });

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.setPinyinInput('test');
        result.current.getNext();
      });
    }

    // After expansion, recent answers should reset
    expect(result.current.recentAnswers).toHaveLength(0);
    expect(result.current.adaptiveRange).toBe(110);
  });

  it('should not trim history when loaded history is under limit', () => {
    const smallHistory = Array.from({ length: 50 }, (_, i) => createMockAnswer(i));
    vi.mocked(storageUtils.loadHistory).mockReturnValue(smallHistory);

    const { result } = renderHook(() => useFlashCard());

    expect(result.current.allAnswers).toHaveLength(50);
  });

  it('should trim history when adding new answers exceeds limit', () => {
    // Start with 99 entries (just under limit)
    const initialHistory = Array.from({ length: 99 }, (_, i) => createMockAnswer(i));
    vi.mocked(storageUtils.loadHistory).mockReturnValue(initialHistory);

    const { result } = renderHook(() => useFlashCard());

    // Add 5 more answers (should now be 104, trimmed to 100)
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.getNext();
      });
    }

    // Should be trimmed to MAX_HISTORY_ENTRIES
    expect(result.current.allAnswers.length).toBeLessThanOrEqual(
      ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
    );
  });
});
