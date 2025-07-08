import { Character, HintType, HINT_TYPES } from '../types';
import data from '../output.json';

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

export const validateLimit = (value: string, maxAvailable: number): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) {
    return Math.min(100, maxAvailable);
  }
  return Math.min(parsed, maxAvailable);
};

export const getRandomIndex = (max: number): number => {
  return Math.floor(Math.random() * max);
}; 
