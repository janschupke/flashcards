import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModeNavigation } from './useModeNavigation';
import { FlashcardMode } from '../types';
import { MODES } from '../constants/modes';

describe('useModeNavigation', () => {
  let mockOnModeChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnModeChange = vi.fn();
  });

  it('should navigate to previous mode on ArrowLeft', () => {
    renderHook(
      ({ currentMode }) =>
        useModeNavigation({
          currentMode,
          onModeChange: mockOnModeChange,
        }),
      {
        initialProps: { currentMode: FlashcardMode.SIMPLIFIED },
      }
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);

    // Should navigate to previous mode (BOTH)
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.BOTH);
  });

  it('should navigate to next mode on ArrowRight', () => {
    const { rerender } = renderHook(
      ({ currentMode }) =>
        useModeNavigation({
          currentMode,
          onModeChange: mockOnModeChange,
        }),
      {
        initialProps: { currentMode: FlashcardMode.SIMPLIFIED },
      }
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);

    // Should navigate to next mode (TRADITIONAL)
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.TRADITIONAL);
  });

  it('should not navigate left when at first mode', () => {
    renderHook(() =>
      useModeNavigation({
        currentMode: FlashcardMode.BOTH,
        onModeChange: mockOnModeChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('should not navigate right when at last mode', () => {
    const lastMode = MODES[MODES.length - 1]?.mode ?? FlashcardMode.TRADITIONAL;

    renderHook(() =>
      useModeNavigation({
        currentMode: lastMode,
        onModeChange: mockOnModeChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('should ignore non-arrow keys', () => {
    renderHook(() =>
      useModeNavigation({
        currentMode: FlashcardMode.SIMPLIFIED,
        onModeChange: mockOnModeChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('should prevent default for arrow keys', () => {
    renderHook(() =>
      useModeNavigation({
        currentMode: FlashcardMode.SIMPLIFIED,
        onModeChange: mockOnModeChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should update when currentMode changes', () => {
    const { rerender } = renderHook(
      ({ currentMode }) =>
        useModeNavigation({
          currentMode,
          onModeChange: mockOnModeChange,
        }),
      {
        initialProps: { currentMode: FlashcardMode.BOTH },
      }
    );

    // Change to SIMPLIFIED
    rerender({ currentMode: FlashcardMode.SIMPLIFIED });

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);

    // Should navigate from SIMPLIFIED to BOTH
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.BOTH);
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useModeNavigation({
        currentMode: FlashcardMode.SIMPLIFIED,
        onModeChange: mockOnModeChange,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});


