import { FlashcardMode } from '../types';

/**
 * Mode configuration constants
 * Extracted from ModeToggleButtons to avoid circular dependencies
 */
export const MODES: { mode: FlashcardMode; label: string; title: string }[] = [
  { mode: FlashcardMode.PINYIN, label: '拼音 (F1)', title: '拼音模式 - Pinyin Mode (F1)' },
  { mode: FlashcardMode.SIMPLIFIED, label: '简体 (F2)', title: '简体模式 - Simplified Mode (F2)' },
  {
    mode: FlashcardMode.TRADITIONAL,
    label: '繁体 (F3)',
    title: '繁体模式 - Traditional Mode (F3)',
  },
];

