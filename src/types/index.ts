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
  mode: FlashcardMode; // Track which mode the answer was given in
}

// Answer type that includes correct/incorrect status
export interface Answer extends IncorrectAnswer {
  isCorrect: boolean;
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
  // New fields for traditional character feature
  displayMode: 'simplified' | 'traditional' | 'both';
  pinyinInput: string;
  isPinyinCorrect: boolean | null;
  correctAnswers: number;
  totalAttempted: number;
  flashResult: FlashResult | null;
  // Previous character tracking
  previousCharacter: number | null;
  // Previous answer tracking (includes submitted answer and correct/incorrect status)
  previousAnswer: Answer | null;
  // Incorrect answers tracking
  incorrectAnswers: IncorrectAnswer[];
  // All answers tracking (correct and incorrect)
  allAnswers: Answer[];
  // New fields for flashcard modes
  mode: FlashcardMode;
  characterInput: string; // New field for character modes
  isCharacterCorrect: boolean | null; // New field for character validation
  // Adaptive learning fields
  adaptiveRange: number;
  answersSinceLastCheck: number;
}

export interface FlashCardActions {
  getNext: () => void;
  toggleHint: (hintType: HintType) => void;
  reset: () => void;
  resetStatistics: () => void;
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

// Export layout and component types
export * from './layout';
export * from './components';
