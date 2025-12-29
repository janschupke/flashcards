import { FlashcardMode } from '../types';

/**
 * Mode configuration constants
 * Extracted from ModeToggleButtons to avoid circular dependencies
 */
export const MODES: { mode: FlashcardMode; label: string; title: string }[] = [
  {
    mode: FlashcardMode.BOTH,
    label: '全部 (F1)',
    title: '显示全部字符 - Show Both Characters (F1)',
  },
  {
    mode: FlashcardMode.SIMPLIFIED,
    label: '简体 (F2)',
    title: '仅显示简体 - Show Simplified Only (F2)',
  },
  {
    mode: FlashcardMode.TRADITIONAL,
    label: '繁体 (F3)',
    title: '仅显示繁体 - Show Traditional Only (F3)',
  },
];
