import { Character, FlashcardMode, HintType, HINT_TYPES } from '../types';
import { UI_CONSTANTS } from '../constants';
import data from '../data/characters.json';

export const getCharacterByIndex = (index: number): Character | null => {
  return data[index] ?? null;
};

export const getHintText = (character: Character | null, hintType: HintType): string => {
  if (!character) return '?';

  switch (hintType) {
    case HINT_TYPES.NONE:
      return 'Use buttons in top panel to reveal';
    case HINT_TYPES.PINYIN:
      return character.pinyin;
    case HINT_TYPES.ENGLISH:
      return character.english;
    default:
      return '?';
  }
};

export const validateLimit = (
  value: string,
  minAvailable: number,
  maxAvailable: number
): number => {
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
 * Gets the character to display based on the current display mode
 * @param character - Current character data
 * @param mode - Current display mode (controls what's shown, not input)
 * @returns Character to display for the mode
 */
export const getDisplayCharacter = (
  character: Character,
  mode: FlashcardMode
): { simplified: string; traditional: string } => {
  switch (mode) {
    case FlashcardMode.BOTH:
      return { simplified: character.simplified, traditional: character.traditional };
    case FlashcardMode.SIMPLIFIED:
      return { simplified: character.simplified, traditional: '' };
    case FlashcardMode.TRADITIONAL:
      return { simplified: '', traditional: character.traditional };
    default:
      return { simplified: character.simplified, traditional: character.traditional };
  }
};

/**
 * Gets a random character index from the dataset
 * @param limit - Maximum index to use (capped at dataset length)
 * @returns Random character index within the limit
 */
export const getRandomCharacterIndex = (limit: number): number => {
  const maxIndex = Math.min(limit, data.length);
  return Math.floor(Math.random() * maxIndex);
};
