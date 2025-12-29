import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlashCard } from './useFlashCard';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { Answer } from '../types';

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
  createAnswer: vi.fn((char, input, index, isCorrect) => ({
    characterIndex: index,
    submittedPinyin: input,
    correctPinyin: char.pinyin,
    simplified: char.simplified,
    traditional: char.traditional,
    english: char.english,
    isCorrect,
  })),
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
    const { loadHistory } = require('../utils/storageUtils');
    const largeHistory = Array.from({ length: 150 }, (_, i) => createMockAnswer(i));
    loadHistory.mockReturnValue(largeHistory);

    const { result } = renderHook(() => useFlashCard());

    expect(result.current.allAnswers).toHaveLength(ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES);
    // Should keep last 100 entries (50-149)
    expect(result.current.allAnswers[0]?.characterIndex).toBe(50);
    expect(result.current.allAnswers[result.current.allAnswers.length - 1]?.characterIndex).toBe(
      149
    );
  });

  it('should not trim history when loaded history is under limit', () => {
    const { loadHistory } = require('../utils/storageUtils');
    const smallHistory = Array.from({ length: 50 }, (_, i) => createMockAnswer(i));
    loadHistory.mockReturnValue(smallHistory);

    const { result } = renderHook(() => useFlashCard());

    expect(result.current.allAnswers).toHaveLength(50);
  });

  it('should trim history when adding new answers exceeds limit', async () => {
    const { loadHistory } = require('../utils/storageUtils');
    // Start with 99 entries (just under limit)
    const initialHistory = Array.from({ length: 99 }, (_, i) => createMockAnswer(i));
    loadHistory.mockReturnValue(initialHistory);

    const { result } = renderHook(() => useFlashCard());

    // Add 5 more answers (should now be 104, trimmed to 100)
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        result.current.getNext();
      });
    }

    // Should be trimmed to MAX_HISTORY_ENTRIES
    expect(result.current.allAnswers.length).toBeLessThanOrEqual(
      ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
    );
  });
});
