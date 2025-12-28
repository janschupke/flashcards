import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlashAnimation } from './useFlashAnimation';
import { FlashResult } from '../types';
import { ANIMATION_TIMINGS } from '../constants';

describe('useFlashAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns false initially when flashResult is null', () => {
    const { result } = renderHook(() => useFlashAnimation(null));
    expect(result.current).toBe(false);
  });

  it('returns true immediately when flashResult is CORRECT', () => {
    const { result } = renderHook(() => useFlashAnimation(FlashResult.CORRECT));
    expect(result.current).toBe(true);
  });

  it('returns true immediately when flashResult is INCORRECT', () => {
    const { result } = renderHook(() => useFlashAnimation(FlashResult.INCORRECT));
    expect(result.current).toBe(true);
  });

  it('returns false after animation duration when flashResult is CORRECT', () => {
    const { result } = renderHook(() => useFlashAnimation(FlashResult.CORRECT));
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
    });

    expect(result.current).toBe(false);
  });

  it('returns false after animation duration when flashResult is INCORRECT', () => {
    const { result } = renderHook(() => useFlashAnimation(FlashResult.INCORRECT));
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
    });

    expect(result.current).toBe(false);
  });

  it('resets when flashResult changes from CORRECT to null', () => {
    const { result, rerender } = renderHook(
      ({ flashResult }: { flashResult: FlashResult | null }) => useFlashAnimation(flashResult),
      {
        initialProps: { flashResult: FlashResult.CORRECT as FlashResult | null },
      }
    );

    expect(result.current).toBe(true);

    // Change to null - should immediately set isFlashing to false
    rerender({ flashResult: null as FlashResult | null });
    expect(result.current).toBe(false);
  });

  it('handles rapid flashResult changes', () => {
    const { result, rerender } = renderHook(
      ({ flashResult }: { flashResult: FlashResult | null }) => useFlashAnimation(flashResult),
      {
        initialProps: { flashResult: FlashResult.CORRECT as FlashResult | null },
      }
    );

    expect(result.current).toBe(true);

    // Change to null - should reset immediately
    rerender({ flashResult: null as FlashResult | null });
    expect(result.current).toBe(false);

    // Change to INCORRECT - should set isFlashing to true again
    rerender({ flashResult: FlashResult.INCORRECT as FlashResult | null });
    expect(result.current).toBe(true);
  });
});
