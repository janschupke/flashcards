export interface Character {
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
}

export interface IncorrectAnswer {
  characterIndex: number;
  submittedPinyin: string;
  correctPinyin: string;
  simplified: string;
  traditional: string;
  english: string;
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
  flashResult: 'correct' | 'incorrect' | null;
  // Previous character tracking
  previousCharacter: number | null;
  // Incorrect answers tracking
  incorrectAnswers: IncorrectAnswer[];
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
  PINYIN: [','],
  ENGLISH: ['.'],
} as const;

export const DEFAULT_CONFIG = {
  DEFAULT_LIMIT: 500,
  MIN_LIMIT: 1,
  PROGRESS_UPDATE_DELAY: 300,
} as const;

// New types for traditional character feature
export interface PinyinInputProps {
  value: string;
  onChange: (value: string) => void;
  currentPinyin: string; // Correct pinyin for current character
  onSubmit: (input: string) => void;
  isCorrect: boolean | null; // null = not evaluated, true/false = result
  disabled?: boolean;
  flashResult?: 'correct' | 'incorrect' | null;
} 
