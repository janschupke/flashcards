import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS } from '../types';

interface UseKeyboardShortcutsProps {
  onNext: () => void;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
}

export const useKeyboardShortcuts = ({
  onNext,
  onTogglePinyin,
  onToggleEnglish,
}: UseKeyboardShortcutsProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_SHORTCUTS.NEXT:
        event.preventDefault();
        onNext();
        break;
      case KEYBOARD_SHORTCUTS.PINYIN[0]:
      case KEYBOARD_SHORTCUTS.PINYIN[1]:
        event.preventDefault();
        onTogglePinyin();
        break;
      case KEYBOARD_SHORTCUTS.ENGLISH[0]:
      case KEYBOARD_SHORTCUTS.ENGLISH[1]:
        event.preventDefault();
        onToggleEnglish();
        break;
    }
  }, [onNext, onTogglePinyin, onToggleEnglish]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}; 
