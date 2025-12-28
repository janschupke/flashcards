import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlashCard } from './useFlashCard';
// APP_LIMITS is used in test comments and assertions
import { FlashcardMode, HintType } from '../types';

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
    // Mock Math.random to return 0 for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
          initialLimit: 3,
        })
      );

      expect(result.current.current).toBe(2);
      expect(result.current.limit).toBe(3);
      expect(result.current.hint).toBe('NONE');
      expect(result.current.totalSeen).toBe(0);
    });

    it('caps initial limit to available data length', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialLimit: 100,
        })
      );

      expect(result.current.limit).toBe(5); // data.length is 5
    });
  });

  describe('getNext', () => {
    it('advances to a new character and resets hint', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
          initialLimit: 5,
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
          initialLimit: 5,
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

  describe('updateLimit', () => {
    it('updates limit and resets state', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
          initialLimit: 5,
        })
      );

      // First, increment seen count
      act(() => {
        result.current.getNext();
      });
      expect(result.current.totalSeen).toBe(1);

      // Update limit
      act(() => {
        result.current.updateLimit(3);
      });

      expect(result.current.limit).toBe(3);
      expect(result.current.current).toBe(0); // Math.random returns 0
      expect(result.current.totalSeen).toBe(1); // Should NOT reset
      expect(result.current.hint).toBe('NONE'); // Should reset
    });

    it('caps limit to available data length', () => {
      const { result } = renderHook(() => useFlashCard());

      act(() => {
        result.current.updateLimit(100);
      });

      expect(result.current.limit).toBe(5); // data.length is 5
    });
  });

  describe('reset', () => {
    it('resets hint but keeps limit', () => {
      const { result } = renderHook(() =>
        useFlashCard({
          initialCurrent: 0,
          initialLimit: 5,
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
      expect(result.current.limit).toBe(5); // Should remain unchanged
      expect(result.current.current).toBe(0); // Math.random returns 0
    });
  });

  it('should reset statistics when mode changes', () => {
    const { result } = renderHook(() => useFlashCard({ initialLimit: 100 }));

    // Set some initial state
    act(() => {
      result.current.getNext();
    });

    expect(result.current.totalSeen).toBe(1);

    // Change mode
    act(() => {
      result.current.setMode(FlashcardMode.SIMPLIFIED);
    });

    expect(result.current.mode).toBe('simplified');
    expect(result.current.totalSeen).toBe(0);
    expect(result.current.correctAnswers).toBe(0);
    expect(result.current.totalAttempted).toBe(0);
    expect(result.current.incorrectAnswers).toEqual([]);
  });

  it('should set appropriate default limits when switching modes', () => {
    const { result } = renderHook(() => useFlashCard({ initialLimit: 100 }));

    // Start in pinyin mode - all modes support 1500 characters
    expect(result.current.mode).toBe('pinyin');
    // Limit should be preserved when switching modes (up to 1500)
    const initialLimit = result.current.limit;

    // Switch to simplified mode - limit should be preserved
    act(() => {
      result.current.setMode(FlashcardMode.SIMPLIFIED);
    });

    expect(result.current.mode).toBe('simplified');
    expect(result.current.limit).toBe(initialLimit);

    // Switch back to pinyin mode - limit should be preserved
    act(() => {
      result.current.setMode(FlashcardMode.PINYIN);
    });

    expect(result.current.mode).toBe('pinyin');
    expect(result.current.limit).toBe(initialLimit);

    // Switch to traditional mode - limit should be preserved
    act(() => {
      result.current.setMode(FlashcardMode.TRADITIONAL);
    });

    expect(result.current.mode).toBe('traditional');
    expect(result.current.limit).toBe(initialLimit);
  });
});
