import { describe, it, expect, vi } from 'vitest';
import {
  getCharacterByIndex,
  getHintText,
  validateLimit,
  getRandomIndex,
  getDisplayCharacter,
  getRandomCharacterIndex,
} from './characterUtils';
import { FlashcardMode, HintType } from '../types';

// Mock the data import
vi.mock('../data/characters.json', () => ({
  default: [
    { item: '1', simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' },
    { item: '2', simplified: '二', traditional: '二', pinyin: 'èr', english: 'two' },
    { item: '3', simplified: '三', traditional: '三', pinyin: 'sān', english: 'three' },
    { item: '4', simplified: '四', traditional: '四', pinyin: 'sì', english: 'four' },
    { item: '5', simplified: '五', traditional: '五', pinyin: 'wǔ', english: 'five' },
    { item: '6', simplified: '六', traditional: '六', pinyin: 'liù', english: 'six' },
    { item: '7', simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' },
    { item: '8', simplified: '这', traditional: '這', pinyin: 'zhè', english: 'this' },
    { item: '9', simplified: '个', traditional: '個', pinyin: 'gè', english: 'measure' },
  ],
}));

describe('characterUtils', () => {
  describe('getCharacterByIndex', () => {
    it('returns character at valid index', () => {
      const character = getCharacterByIndex(1);
      expect(character).toEqual({
        item: '2',
        simplified: '二',
        traditional: '二',
        pinyin: 'èr',
        english: 'two',
      });
    });

    it('returns null for invalid index', () => {
      const character = getCharacterByIndex(10);
      expect(character).toBeNull();
    });

    it('returns null for negative index', () => {
      const character = getCharacterByIndex(-1);
      expect(character).toBeNull();
    });
  });

  describe('getHintText', () => {
    const mockCharacter = {
      item: '1',
      simplified: '一',
      traditional: '一',
      pinyin: 'yī',
      english: 'one',
    };

    it('returns default message when no hint is active', () => {
      const text = getHintText(mockCharacter, HintType.NONE);
      expect(text).toBe('Use buttons in top panel to reveal');
    });

    it('returns pinyin when pinyin hint is active', () => {
      const text = getHintText(mockCharacter, HintType.PINYIN);
      expect(text).toBe('yī');
    });

    it('returns english when english hint is active', () => {
      const text = getHintText(mockCharacter, HintType.ENGLISH);
      expect(text).toBe('one');
    });

    it('returns fallback for unknown hint type', () => {
      const text = getHintText(mockCharacter, 'UNKNOWN' as HintType);
      expect(text).toBe('?');
    });

    it('returns fallback when character is null', () => {
      const text = getHintText(null, HintType.PINYIN);
      expect(text).toBe('?');
    });
  });

  describe('validateLimit', () => {
    it('returns parsed number for valid input', () => {
      expect(validateLimit('5', 1, 10)).toBe(5);
      expect(validateLimit('10', 1, 10)).toBe(10);
    });

    it('caps value to maximum available', () => {
      expect(validateLimit('15', 1, 10)).toBe(10);
    });

    it('returns default for invalid input', () => {
      expect(validateLimit('abc', 1, 10)).toBe(10);
      expect(validateLimit('', 1, 10)).toBe(10);
    });

    it('returns default for zero or negative input', () => {
      expect(validateLimit('0', 1, 10)).toBe(10);
      expect(validateLimit('-5', 1, 10)).toBe(10);
    });

    it('handles edge case where max is smaller than default', () => {
      expect(validateLimit('abc', 1, 5)).toBe(5);
    });
  });

  describe('getRandomIndex', () => {
    it('returns number within valid range', () => {
      const result = getRandomIndex(5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(5);
    });

    it('returns 0 for max of 1', () => {
      const result = getRandomIndex(1);
      expect(result).toBe(0);
    });

    it('handles zero max gracefully', () => {
      const result = getRandomIndex(0);
      expect(result).toBe(0);
    });
  });

  describe('getDisplayCharacter', () => {
    const mockCharacter = {
      item: '7',
      simplified: '们',
      traditional: '們',
      pinyin: 'men',
      english: 'plural',
    };

    it('returns both characters for BOTH mode', () => {
      const result = getDisplayCharacter(mockCharacter, FlashcardMode.BOTH);
      expect(result).toEqual({ simplified: '们', traditional: '們' });
    });

    it('returns only simplified for SIMPLIFIED mode', () => {
      const result = getDisplayCharacter(mockCharacter, FlashcardMode.SIMPLIFIED);
      expect(result).toEqual({ simplified: '们', traditional: '' });
    });

    it('returns only traditional for TRADITIONAL mode', () => {
      const result = getDisplayCharacter(mockCharacter, FlashcardMode.TRADITIONAL);
      expect(result).toEqual({ simplified: '', traditional: '們' });
    });
  });

  describe('getRandomCharacterIndex', () => {
    it('returns index within limit', () => {
      const result = getRandomCharacterIndex(4);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(4);
    });

    it('caps to dataset maximum', () => {
      const result = getRandomCharacterIndex(10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(10);
    });
  });
});
