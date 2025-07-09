export interface Character {
  chinese: string;
  pinyin: string;
  english: string;
  traditional?: string; // Add traditional field
}

export interface FlashCardState {
  current: number;
  limit: number;
  hint: HintType;
  totalSeen: number;
  progress: number;
  // New fields for traditional character feature
  displayMode: 'simplified' | 'traditional' | 'both';
  pinyinInput: string;
  isPinyinCorrect: boolean | null;
  correctAnswers: number;
  totalAttempted: number;
}

export interface FlashCardActions {
  getNext: () => void;
  toggleHint: (hintType: HintType) => void;
  updateLimit: (newLimit: number) => void;
  reset: () => void;
  // New actions for traditional character feature
  setDisplayMode: (mode: 'simplified' | 'traditional' | 'both') => void;
  setPinyinInput: (input: string) => void;
  evaluatePinyin: () => void;
  resetScore: () => void;
}

export interface FlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export type HintType = 'NONE' | 'PINYIN' | 'ENGLISH';

export const HINT_TYPES = {
  NONE: 'NONE',
  PINYIN: 'PINYIN',
  ENGLISH: 'ENGLISH',
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

// New types for traditional character feature
export interface PinyinInputProps {
  currentPinyin: string; // Correct pinyin for current character
  onSubmit: (input: string) => void;
  isCorrect: boolean | null; // null = not evaluated, true/false = result
  disabled?: boolean;
} 
