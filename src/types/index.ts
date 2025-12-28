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
  simplified: string;
  traditional: string;
  english: string;
}

// Answer type that includes correct/incorrect status
export interface Answer extends IncorrectAnswer {
  isCorrect: boolean;
}

// Display mode enum - controls what characters are shown, not input type
export enum FlashcardMode {
  BOTH = 'both', // Show both simplified and traditional
  SIMPLIFIED = 'simplified', // Show only simplified
  TRADITIONAL = 'traditional', // Show only traditional
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
  // Display mode - controls what characters are shown
  mode: FlashcardMode;
  // Adaptive learning fields
  adaptiveRange: number;
  answersSinceLastCheck: number;
}

export interface FlashCardActions {
  getNext: () => void;
  toggleHint: (hintType: HintType) => void;
  reset: () => void;
  resetStatistics: () => void;
  setPinyinInput: (input: string) => void;
  evaluatePinyin: () => void;
  resetScore: () => void;
  // Display mode action - controls what characters are shown
  setMode: (mode: FlashcardMode) => void;
  // Pinyin input action
  setPinyinFlashResult: (input: string) => void;
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
  MODE_BOTH: 'F1',
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

// New types for mode toggle buttons
export interface ModeToggleButtonsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
}

// Export layout and component types
export * from './layout';
export * from './components';
