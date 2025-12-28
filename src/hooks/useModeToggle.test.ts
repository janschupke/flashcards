import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useModeToggle } from './useModeToggle';
import { FlashcardMode } from '../types';

describe('useModeToggle', () => {
  it('calls onModeChange when mode is different from currentMode', () => {
    const mockOnModeChange = vi.fn();
    const { result } = renderHook(() => useModeToggle(FlashcardMode.PINYIN, mockOnModeChange));

    act(() => {
      result.current.handleModeChange(FlashcardMode.SIMPLIFIED);
    });

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onModeChange when mode is same as currentMode', () => {
    const mockOnModeChange = vi.fn();
    const { result } = renderHook(() => useModeToggle(FlashcardMode.PINYIN, mockOnModeChange));

    act(() => {
      result.current.handleModeChange(FlashcardMode.PINYIN);
    });

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('updates when currentMode changes', () => {
    const mockOnModeChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ currentMode }) => useModeToggle(currentMode, mockOnModeChange),
      {
        initialProps: { currentMode: FlashcardMode.PINYIN },
      }
    );

    act(() => {
      result.current.handleModeChange(FlashcardMode.SIMPLIFIED);
    });

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);

    rerender({ currentMode: FlashcardMode.SIMPLIFIED });

    act(() => {
      result.current.handleModeChange(FlashcardMode.SIMPLIFIED);
    });

    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
  });
});
