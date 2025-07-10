import { Character, FlashcardMode, HintType, HINT_TYPES } from '../types';
import { UI_CONSTANTS } from '../constants';
import data from '../data.json';

export const getCharacterByIndex = (index: number): Character | null => {
  return data[index] || null;
};

export const getHintText = (character: Character | null, hintType: HintType): string => {
  if (!character) return '?';
  
  switch (hintType) {
    case HINT_TYPES.NONE:
      return 'Tap a button below to reveal';
    case HINT_TYPES.PINYIN:
      return character.pinyin;
    case HINT_TYPES.ENGLISH:
      return character.english;
    default:
      return '?';
  }
};

export const validateLimit = (value: string, minAvailable: number, maxAvailable: number): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return Math.max(minAvailable, Math.min(UI_CONSTANTS.MIN_WIDTH, maxAvailable));
  }
  return Math.max(minAvailable, Math.min(parsed, maxAvailable));
};

export const getRandomIndex = (max: number): number => {
  return Math.floor(Math.random() * max);
};

/**
 * Validates character input against expected character
 * @param input - User input character
 * @param expected - Expected character
 * @returns boolean indicating if input matches expected
 */
export const validateCharacterInput = (input: string, expected: string): boolean => {
  return input.trim() === expected;
};

/**
 * Gets filtered character list based on mode
 * @param mode - Current flashcard mode
 * @returns Array of characters appropriate for the mode
 */
export const getFilteredCharacters = (mode: FlashcardMode): Character[] => {
  switch (mode) {
    case 'pinyin':
      return data;
    case 'simplified':
    case 'traditional':
      // Only use characters where simplified ≠ traditional
      return data.filter(char => char.simplified !== char.traditional);
    default:
      return data;
  }
};

/**
 * Gets the maximum available limit for a given mode
 * @param mode - Current flashcard mode
 * @returns Maximum number of characters available for the mode
 */
export const getModeSpecificLimit = (mode: FlashcardMode): number => {
  const filteredCharacters = getFilteredCharacters(mode);
  return filteredCharacters.length;
};

/**
 * Gets the expected character for the current mode
 * @param character - Current character data
 * @param mode - Current flashcard mode
 * @returns Expected character for the mode
 */
export const getExpectedCharacter = (character: Character, mode: FlashcardMode): string => {
  switch (mode) {
    case 'simplified':
      return character.simplified;
    case 'traditional':
      return character.traditional;
    default:
      return character.simplified; // Fallback
  }
};

/**
 * Gets the character to display based on the current mode
 * @param character - Current character data
 * @param mode - Current flashcard mode
 * @returns Character to display for the mode
 */
export const getDisplayCharacter = (character: Character, mode: FlashcardMode): { simplified: string; traditional: string } => {
  switch (mode) {
    case 'pinyin':
      return { simplified: character.simplified, traditional: character.traditional };
    case 'simplified':
      return { simplified: '', traditional: character.traditional };
    case 'traditional':
      return { simplified: character.simplified, traditional: '' };
    default:
      return { simplified: character.simplified, traditional: character.traditional };
  }
};

/**
 * Gets a random character index from the filtered character list
 * @param mode - Current flashcard mode
 * @param limit - Current limit
 * @returns Random character index within the limit
 */
export const getRandomCharacterIndex = (mode: FlashcardMode, limit: number): number => {
  const maxIndex = Math.min(limit, getModeSpecificLimit(mode));
  return Math.floor(Math.random() * maxIndex);
};

/**
 * Gets the character at a specific index from the filtered list
 * @param index - Character index
 * @param mode - Current flashcard mode
 * @returns Character data or null if index is out of bounds
 */
export const getCharacterAtIndex = (index: number, mode: FlashcardMode): Character | null => {
  const filteredCharacters = getFilteredCharacters(mode);
  if (index >= 0 && index < filteredCharacters.length) {
    return filteredCharacters[index];
  }
  return null;
}; 
