import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS, FlashcardMode } from '../types';
import { isEditableTarget, hasPlatformModifier } from '../utils/keyboardUtils';

interface UseKeyboardShortcutsProps {
  onNext: () => void;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
  onModeChange?: (mode: FlashcardMode) => void;
}

export const useKeyboardShortcuts = ({
  onNext,
  onTogglePinyin,
  onToggleEnglish,
  onModeChange,
}: UseKeyboardShortcutsProps): void => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent): void => {
      // Function keys never collide with typing, so they stay unmodified and
      // work regardless of where focus currently is.
      switch (event.key) {
        case KEYBOARD_SHORTCUTS.MODE_BOTH:
          event.preventDefault();
          onModeChange?.(FlashcardMode.BOTH);
          return;
        case KEYBOARD_SHORTCUTS.MODE_SIMPLIFIED:
          event.preventDefault();
          onModeChange?.(FlashcardMode.SIMPLIFIED);
          return;
        case KEYBOARD_SHORTCUTS.MODE_TRADITIONAL:
          event.preventDefault();
          onModeChange?.(FlashcardMode.TRADITIONAL);
          return;
      }

      // Enter is handled by the input itself when the input has focus, so the
      // global binding only covers the case where focus is elsewhere.
      // Without this guard the answer would be submitted twice per press.
      if (event.key === KEYBOARD_SHORTCUTS.NEXT) {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        onNext();
        return;
      }

      // Hint toggles are modifier-gated so `.` and `/` remain typable.
      if (!hasPlatformModifier(event)) {
        return;
      }

      switch (event.key) {
        case KEYBOARD_SHORTCUTS.PINYIN:
          event.preventDefault();
          onTogglePinyin();
          break;
        case KEYBOARD_SHORTCUTS.ENGLISH:
          event.preventDefault();
          onToggleEnglish();
          break;
      }
    },
    [onNext, onTogglePinyin, onToggleEnglish, onModeChange]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};
