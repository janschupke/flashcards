import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { KEYBOARD_SHORTCUTS, FlashcardMode } from '../types';

describe('useKeyboardShortcuts', () => {
  let mockOnNext: Mock<() => void>;
  let mockOnTogglePinyin: Mock<() => void>;
  let mockOnToggleEnglish: Mock<() => void>;
  let mockOnModeChange: Mock<(mode: FlashcardMode) => void>;

  beforeEach(() => {
    mockOnNext = vi.fn<() => void>();
    mockOnTogglePinyin = vi.fn<() => void>();
    mockOnToggleEnglish = vi.fn<() => void>();
    mockOnModeChange = vi.fn<(mode: FlashcardMode) => void>();
  });

  it('should call onNext when NEXT key is pressed', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    const event = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.NEXT });
    window.dispatchEvent(event);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
    expect(mockOnTogglePinyin).not.toHaveBeenCalled();
    expect(mockOnToggleEnglish).not.toHaveBeenCalled();
  });

  it('should call onTogglePinyin when PINYIN key is pressed', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    const event = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.PINYIN[0] });
    window.dispatchEvent(event);

    expect(mockOnTogglePinyin).toHaveBeenCalledTimes(1);
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should call onToggleEnglish when ENGLISH key is pressed', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    const event = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.ENGLISH[0] });
    window.dispatchEvent(event);

    expect(mockOnToggleEnglish).toHaveBeenCalledTimes(1);
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should call onModeChange when mode keys are pressed', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
        onModeChange: mockOnModeChange,
      })
    );

    // Test BOTH mode
    const bothEvent = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.MODE_BOTH });
    window.dispatchEvent(bothEvent);
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.BOTH);

    // Test SIMPLIFIED mode
    const simplifiedEvent = new KeyboardEvent('keydown', {
      key: KEYBOARD_SHORTCUTS.MODE_SIMPLIFIED,
    });
    window.dispatchEvent(simplifiedEvent);
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);

    // Test TRADITIONAL mode
    const traditionalEvent = new KeyboardEvent('keydown', {
      key: KEYBOARD_SHORTCUTS.MODE_TRADITIONAL,
    });
    window.dispatchEvent(traditionalEvent);
    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.TRADITIONAL);
  });

  it('should not call onModeChange if not provided', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    const event = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.MODE_BOTH });
    window.dispatchEvent(event);

    // Should not throw, just not call anything
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should prevent default behavior for handled keys', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    const event = new KeyboardEvent('keydown', { key: KEYBOARD_SHORTCUTS.NEXT, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
