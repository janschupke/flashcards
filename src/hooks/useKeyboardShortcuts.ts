import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS, FlashcardMode } from '../types';

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
}: UseKeyboardShortcutsProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_SHORTCUTS.NEXT:
        event.preventDefault();
        onNext();
        break;
      case KEYBOARD_SHORTCUTS.PINYIN[0]:
        event.preventDefault();
        onTogglePinyin();
        break;
      case KEYBOARD_SHORTCUTS.ENGLISH[0]:
        event.preventDefault();
        onToggleEnglish();
        break;
      case KEYBOARD_SHORTCUTS.MODE_PINYIN:
        event.preventDefault();
        onModeChange?.(FlashcardMode.PINYIN);
        break;
      case KEYBOARD_SHORTCUTS.MODE_SIMPLIFIED:
        event.preventDefault();
        onModeChange?.(FlashcardMode.SIMPLIFIED);
        break;
      case KEYBOARD_SHORTCUTS.MODE_TRADITIONAL:
        event.preventDefault();
        onModeChange?.(FlashcardMode.TRADITIONAL);
        break;
    }
  }, [onNext, onTogglePinyin, onToggleEnglish, onModeChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}; 
