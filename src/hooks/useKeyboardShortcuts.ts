import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS, HINT_TYPES } from '../types';

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
      case 'p':
      case 'P':
        event.preventDefault();
        onTogglePinyin();
        break;
      case 'e':
      case 'E':
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
