import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { KEYBOARD_SHORTCUTS, FlashcardMode } from '../types';

// Mirrors the platform check in keyboardUtils so these tests assert the binding
// that actually ships on whichever platform the suite runs on.
const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const withModifier = isMac ? { metaKey: true } : { ctrlKey: true };

describe('useKeyboardShortcuts', () => {
  let mockOnNext: Mock<() => void>;
  let mockOnTogglePinyin: Mock<() => void>;
  let mockOnToggleEnglish: Mock<() => void>;
  let mockOnModeChange: Mock<(mode: FlashcardMode) => void>;
  let input: HTMLInputElement;

  const mount = (withModeChange = false): ReturnType<typeof renderHook> =>
    renderHook(() =>
      useKeyboardShortcuts({
        onNext: mockOnNext,
        onTogglePinyin: mockOnTogglePinyin,
        onToggleEnglish: mockOnToggleEnglish,
        ...(withModeChange ? { onModeChange: mockOnModeChange } : {}),
      })
    );

  /** Dispatch from an element so the event carries a real target as it bubbles. */
  const pressFrom = (target: EventTarget, init: KeyboardEventInit): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    mockOnNext = vi.fn<() => void>();
    mockOnTogglePinyin = vi.fn<() => void>();
    mockOnToggleEnglish = vi.fn<() => void>();
    mockOnModeChange = vi.fn<(mode: FlashcardMode) => void>();
    input = document.createElement('input');
    document.body.appendChild(input);
  });

  afterEach(() => {
    input.remove();
  });

  describe('Enter', () => {
    it('advances when focus is not in a text field', () => {
      mount();

      const event = pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.NEXT });

      expect(mockOnNext).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('does NOT advance when the event came from an input', () => {
      mount();

      pressFrom(input, { key: KEYBOARD_SHORTCUTS.NEXT });

      // The input drives submission itself; firing here too would evaluate
      // the answer twice for a single press.
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('hint toggles', () => {
    it('toggles the pinyin hint with the platform modifier', () => {
      mount();

      const event = pressFrom(document.body, {
        key: KEYBOARD_SHORTCUTS.PINYIN,
        ...withModifier,
      });

      expect(mockOnTogglePinyin).toHaveBeenCalledTimes(1);
      expect(mockOnToggleEnglish).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('toggles the english hint with the platform modifier', () => {
      mount();

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.ENGLISH, ...withModifier });

      expect(mockOnToggleEnglish).toHaveBeenCalledTimes(1);
      expect(mockOnTogglePinyin).not.toHaveBeenCalled();
    });

    it('still toggles while an input has focus, since the modifier disambiguates', () => {
      mount();

      pressFrom(input, { key: KEYBOARD_SHORTCUTS.PINYIN, ...withModifier });

      expect(mockOnTogglePinyin).toHaveBeenCalledTimes(1);
    });

    it('ignores the bare keys so they stay typable', () => {
      mount();

      const pinyin = pressFrom(input, { key: KEYBOARD_SHORTCUTS.PINYIN });
      const english = pressFrom(input, { key: KEYBOARD_SHORTCUTS.ENGLISH });

      expect(mockOnTogglePinyin).not.toHaveBeenCalled();
      expect(mockOnToggleEnglish).not.toHaveBeenCalled();
      expect(pinyin.defaultPrevented).toBe(false);
      expect(english.defaultPrevented).toBe(false);
    });

    it('ignores the bare keys outside a text field too', () => {
      mount();

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.PINYIN });

      expect(mockOnTogglePinyin).not.toHaveBeenCalled();
    });

    it('ignores the other modifier on the platform that does not use it', () => {
      mount();

      pressFrom(document.body, {
        key: KEYBOARD_SHORTCUTS.PINYIN,
        ...(isMac ? { ctrlKey: true } : { metaKey: true }),
      });

      expect(mockOnTogglePinyin).not.toHaveBeenCalled();
    });
  });

  describe('mode keys', () => {
    it('switches mode on F1, F2 and F3', () => {
      mount(true);

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.MODE_BOTH });
      expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.BOTH);

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.MODE_SIMPLIFIED });
      expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.MODE_TRADITIONAL });
      expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.TRADITIONAL);
    });

    it('works from inside an input, since function keys never collide with typing', () => {
      mount(true);

      pressFrom(input, { key: KEYBOARD_SHORTCUTS.MODE_SIMPLIFIED });

      expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
    });

    it('does not throw when onModeChange is omitted', () => {
      mount();

      pressFrom(document.body, { key: KEYBOARD_SHORTCUTS.MODE_BOTH });

      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  it('cleans up the event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = mount();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
