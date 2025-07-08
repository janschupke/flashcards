export interface Character {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface FlashCardState {
  current: number;
  limit: number;
  hint: number;
  totalSeen: number;
  progress: number;
}

export interface FlashCardActions {
  getNext: () => void;
  toggleHint: (hintType: HintType) => void;
  updateLimit: (newLimit: number) => void;
  reset: () => void;
}

export interface FlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export type HintType = 0 | 1 | 2;

export const HINT_TYPES = {
  NONE: 0,
  PINYIN: 1,
  ENGLISH: 2,
} as const;

export const KEYBOARD_SHORTCUTS = {
  NEXT: 'Enter',
  PINYIN: ['p', 'P'],
  ENGLISH: ['e', 'E'],
} as const;

export const DEFAULT_CONFIG = {
  DEFAULT_LIMIT: 100,
  MIN_LIMIT: 1,
  PROGRESS_UPDATE_DELAY: 300,
} as const; 
