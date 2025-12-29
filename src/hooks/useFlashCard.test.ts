import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlashCard } from './useFlashCard';
// APP_LIMITS is used in test comments and assertions
import { FlashcardMode, HintType } from '../types';
import { clearAllStorage, saveMode } from '../utils/storageUtils';

// Mock the data import
vi.mock('../data/characters.json', () => ({
  default: [
    { item: '1', simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' },
    { item: '2', simplified: '二', traditional: '二', pinyin: 'èr', english: 'two' },
    { item: '3', simplified: '三', traditional: '三', pinyin: 'sān', english: 'three' },
    { item: '4', simplified: '四', traditional: '四', pinyin: 'sì', english: 'four' },
    { item: '5', simplified: '五', traditional: '五', pinyin: 'wǔ', english: 'five' },
  ],
}));

describe('useFlashCard', () => {
  beforeEach(() => {
    // Clear storage before each test to ensure clean state
    clearAllStorage();
    // Mock Math.random to return 0 for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearAllStorage();
  });

  describe('initialization', () => {
    it('initializes with default values when no props provided', () => {
      const { result } = renderHook(() => useFlashCard());

      expect(result.current.current).toBe(0); // Math.random returns 0
      expect(result.current.limit).toBe(5); // data.length is 5
      expect(result.current.hint).toBe('NONE');
      expect(result.current.totalSeen).toBe(0);
    });

    it('initializes with provided initial values', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 2,
        })
      );

      expect(result.current.current).toBe(2);
      expect(result.current.hint).toBe('NONE');
      expect(result.current.totalSeen).toBe(0);
    });

    it('loads mode from storage on initialization', () => {
      // Save a mode to storage
      saveMode(FlashcardMode.SIMPLIFIED);

      const { result } = renderHook(() => useFlashCard());

      expect(result.current.mode).toBe(FlashcardMode.SIMPLIFIED);
    });

    it('defaults to BOTH mode when no mode is stored', () => {
      // Ensure storage is clear
      clearAllStorage();

      const { result } = renderHook(() => useFlashCard());

      expect(result.current.mode).toBe(FlashcardMode.BOTH);
    });
  });

  describe('getNext', () => {
    it('advances to a new character and resets hint', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
        })
      );

      // Set hint to pinyin first
      act(() => {
        result.current.toggleHint(HintType.PINYIN);
      });
      expect(result.current.hint).toBe('PINYIN');

      // Get next character
      act(() => {
        result.current.getNext();
      });

      expect(result.current.current).toBe(0); // Math.random returns 0
      expect(result.current.hint).toBe('NONE'); // Hint should be reset
      expect(result.current.totalSeen).toBe(1);
    });

    it('increments totalSeen counter', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
        })
      );

      act(() => {
        result.current.getNext();
      });
      expect(result.current.totalSeen).toBe(1);

      act(() => {
        result.current.getNext();
      });
      expect(result.current.totalSeen).toBe(2);
    });
  });

  describe('toggleHint', () => {
    it('toggles hint on when called with new hint type', () => {
      const { result } = renderHook(() => useFlashCard());

      act(() => {
        result.current.toggleHint(HintType.PINYIN); // Pinyin
      });
      expect(result.current.hint).toBe('PINYIN');

      act(() => {
        result.current.toggleHint(HintType.ENGLISH); // English
      });
      expect(result.current.hint).toBe('ENGLISH');
    });

    it('toggles hint off when called with same hint type', () => {
      const { result } = renderHook(() => useFlashCard());

      act(() => {
        result.current.toggleHint(HintType.PINYIN); // Turn on pinyin
      });
      expect(result.current.hint).toBe('PINYIN');

      act(() => {
        result.current.toggleHint(HintType.PINYIN); // Turn off pinyin
      });
      expect(result.current.hint).toBe('NONE');
    });
  });

  // updateLimit removed - using adaptive range expansion instead

  describe('reset', () => {
    it('resets hint and statistics', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
        })
      );

      // Set some state
      act(() => {
        result.current.getNext();
        result.current.toggleHint(HintType.PINYIN);
      });

      expect(result.current.totalSeen).toBe(1);
      expect(result.current.hint).toBe('PINYIN');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.totalSeen).toBe(0);
      expect(result.current.hint).toBe('NONE');
      expect(result.current.current).toBe(0); // Math.random returns 0
    });
  });

  it('should only change display mode without resetting statistics', () => {
    const { result } = renderHook(() => useFlashCard());

    // Set some initial state
    act(() => {
      result.current.getNext();
    });

    expect(result.current.totalSeen).toBe(1);

    // Change mode - should only affect display, not reset statistics
    act(() => {
      result.current.setMode(FlashcardMode.SIMPLIFIED);
    });

    expect(result.current.mode).toBe('simplified');
    // Statistics should NOT be reset when changing display mode
    expect(result.current.totalSeen).toBe(1);
    expect(result.current.correctAnswers).toBeGreaterThanOrEqual(0);
    expect(result.current.totalAttempted).toBeGreaterThanOrEqual(0);
    // Input should be cleared
    expect(result.current.pinyinInput).toBe('');
    expect(result.current.isPinyinCorrect).toBeNull();
  });

  it('should save mode to storage when mode changes', () => {
    const { result } = renderHook(() => useFlashCard());

    // Change mode
    act(() => {
      result.current.setMode(FlashcardMode.TRADITIONAL);
    });

    expect(result.current.mode).toBe(FlashcardMode.TRADITIONAL);

    // Create a new hook instance - it should load the saved mode
    const { result: result2 } = renderHook(() => useFlashCard());
    expect(result2.current.mode).toBe(FlashcardMode.TRADITIONAL);
  });
});
