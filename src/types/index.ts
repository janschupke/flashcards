export interface Character {
  item: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
}

export interface IncorrectAnswer {
  characterIndex: number;
  submittedPinyin: string;
  correctPinyin: string;
  submittedCharacter?: string; // New field for character input modes
  correctCharacter?: string; // New field for character input modes
  simplified: string;
  traditional: string;
  english: string;
  mode: 'pinyin' | 'simplified' | 'traditional'; // Track which mode the answer was given in
}

// Add new enums
export enum FlashcardMode {
  PINYIN = 'pinyin',
  SIMPLIFIED = 'simplified',
  TRADITIONAL = 'traditional',
}

export enum HintType {
  NONE = 'NONE',
  PINYIN = 'PINYIN',
  ENGLISH = 'ENGLISH',
}

export enum FlashResult {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
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
  flashResult: FlashResult | null;
  // Previous character tracking
  previousCharacter: number | null;
  // Incorrect answers tracking
  incorrectAnswers: IncorrectAnswer[];
  // New fields for flashcard modes
  mode: FlashcardMode;
  characterInput: string; // New field for character modes
  isCharacterCorrect: boolean | null; // New field for character validation
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
  // New actions for flashcard modes
  setMode: (mode: FlashcardMode) => void;
  setCharacterInput: (input: string) => void;
  validateCharacter: () => void;
  // New actions for immediate flash result
  setPinyinFlashResult: (input: string) => void;
  setCharacterFlashResult: (input: string) => void;
}

export interface FlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

// Update existing constants to use enums
export const HINT_TYPES = {
  NONE: HintType.NONE,
  PINYIN: HintType.PINYIN,
  ENGLISH: HintType.ENGLISH,
} as const;

export const KEYBOARD_SHORTCUTS = {
  NEXT: 'Enter',
  PINYIN: [','],
  ENGLISH: ['.'],
  MODE_PINYIN: 'F1',
  MODE_SIMPLIFIED: 'F2',
  MODE_TRADITIONAL: 'F3',
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
  flashResult?: FlashResult | null;
}

// New types for character input feature
export interface CharacterInputProps {
  value: string;
  onChange: (value: string) => void;
  expectedCharacter: string; // Expected character for current mode
  onSubmit: (input: string) => void;
  isCorrect: boolean | null; // null = not evaluated, true/false = result
  disabled?: boolean;
  flashResult?: FlashResult | null;
  mode: FlashcardMode;
}

// New types for mode toggle buttons
export interface ModeToggleButtonsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
} 
