import { describe, it, expect, vi } from 'vitest'
import { 
  getCharacterByIndex, 
  getHintText, 
  validateLimit, 
  getRandomIndex,
  validateCharacterInput,
  getFilteredCharacters,
  getModeSpecificLimit,
  getExpectedCharacter,
  getDisplayCharacter,
  getRandomCharacterIndex,
  getCharacterAtIndex
} from './characterUtils'
import { HINT_TYPES } from '../types'

// Mock the data import
vi.mock('../data.json', () => ({
  default: [
    { simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' },
    { simplified: '二', traditional: '二', pinyin: 'èr', english: 'two' },
    { simplified: '三', traditional: '三', pinyin: 'sān', english: 'three' },
    { simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' },
    { simplified: '这', traditional: '這', pinyin: 'zhè', english: 'this' },
    { simplified: '个', traditional: '個', pinyin: 'gè', english: 'measure' },
  ]
}))

describe('characterUtils', () => {
  describe('getCharacterByIndex', () => {
    it('returns character at valid index', () => {
      const character = getCharacterByIndex(1)
      expect(character).toEqual({ simplified: '二', traditional: '二', pinyin: 'èr', english: 'two' })
    })

    it('returns null for invalid index', () => {
      const character = getCharacterByIndex(10)
      expect(character).toBeNull()
    })

    it('returns null for negative index', () => {
      const character = getCharacterByIndex(-1)
      expect(character).toBeNull()
    })
  })

  describe('getHintText', () => {
    const mockCharacter = { simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' }

    it('returns default message when no hint is active', () => {
      const text = getHintText(mockCharacter, HINT_TYPES.NONE)
      expect(text).toBe('Tap a button below to reveal')
    })

    it('returns pinyin when pinyin hint is active', () => {
      const text = getHintText(mockCharacter, HINT_TYPES.PINYIN)
      expect(text).toBe('yī')
    })

    it('returns english when english hint is active', () => {
      const text = getHintText(mockCharacter, HINT_TYPES.ENGLISH)
      expect(text).toBe('one')
    })

    it('returns fallback for unknown hint type', () => {
      const text = getHintText(mockCharacter, 'UNKNOWN' as any)
      expect(text).toBe('?')
    })

    it('returns fallback when character is null', () => {
      const text = getHintText(null, HINT_TYPES.PINYIN)
      expect(text).toBe('?')
    })
  })

  describe('validateLimit', () => {
    it('returns parsed number for valid input', () => {
      expect(validateLimit('5', 1, 10)).toBe(5)
      expect(validateLimit('10', 1, 10)).toBe(10)
    })

    it('caps value to maximum available', () => {
      expect(validateLimit('15', 1, 10)).toBe(10)
    })

    it('returns default for invalid input', () => {
      expect(validateLimit('abc', 1, 10)).toBe(10)
      expect(validateLimit('', 1, 10)).toBe(10)
    })

    it('returns default for zero or negative input', () => {
      expect(validateLimit('0', 1, 10)).toBe(10)
      expect(validateLimit('-5', 1, 10)).toBe(10)
    })

    it('handles edge case where max is smaller than default', () => {
      expect(validateLimit('abc', 1, 5)).toBe(5)
    })
  })

  describe('getRandomIndex', () => {
    it('returns number within valid range', () => {
      const result = getRandomIndex(5)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(5)
    })

    it('returns 0 for max of 1', () => {
      const result = getRandomIndex(1)
      expect(result).toBe(0)
    })

    it('handles zero max gracefully', () => {
      const result = getRandomIndex(0)
      expect(result).toBe(0)
    })
  })

  describe('validateCharacterInput', () => {
    it('returns true for exact match', () => {
      expect(validateCharacterInput('们', '们')).toBe(true)
      expect(validateCharacterInput('們', '們')).toBe(true)
    })

    it('returns false for different characters', () => {
      expect(validateCharacterInput('们', '們')).toBe(false)
      expect(validateCharacterInput('个', '们')).toBe(false)
    })

    it('handles whitespace correctly', () => {
      expect(validateCharacterInput(' 们 ', '们')).toBe(true)
      expect(validateCharacterInput('', '们')).toBe(false)
    })
  })

  describe('getFilteredCharacters', () => {
    it('returns all characters for pinyin mode', () => {
      const characters = getFilteredCharacters('pinyin')
      expect(characters).toHaveLength(6)
    })

    it('returns only different characters for simplified mode', () => {
      const characters = getFilteredCharacters('simplified')
      expect(characters).toHaveLength(3) // 们, 这, 个 have different simplified/traditional
    })

    it('returns only different characters for traditional mode', () => {
      const characters = getFilteredCharacters('traditional')
      expect(characters).toHaveLength(3) // 们, 这, 个 have different simplified/traditional
    })
  })

  describe('getModeSpecificLimit', () => {
    it('returns total count for pinyin mode', () => {
      expect(getModeSpecificLimit('pinyin')).toBe(6)
    })

    it('returns filtered count for simplified mode', () => {
      expect(getModeSpecificLimit('simplified')).toBe(3)
    })

    it('returns filtered count for traditional mode', () => {
      expect(getModeSpecificLimit('traditional')).toBe(3)
    })
  })

  describe('getExpectedCharacter', () => {
    const mockCharacter = { simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' }

    it('returns simplified for simplified mode', () => {
      expect(getExpectedCharacter(mockCharacter, 'simplified')).toBe('们')
    })

    it('returns traditional for traditional mode', () => {
      expect(getExpectedCharacter(mockCharacter, 'traditional')).toBe('們')
    })

    it('returns simplified as fallback for pinyin mode', () => {
      expect(getExpectedCharacter(mockCharacter, 'pinyin')).toBe('们')
    })
  })

  describe('getDisplayCharacter', () => {
    const mockCharacter = { simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' }

    it('returns both characters for pinyin mode', () => {
      const result = getDisplayCharacter(mockCharacter, 'pinyin')
      expect(result).toEqual({ simplified: '们', traditional: '們' })
    })

    it('returns only traditional for simplified mode', () => {
      const result = getDisplayCharacter(mockCharacter, 'simplified')
      expect(result).toEqual({ simplified: '', traditional: '們' })
    })

    it('returns only simplified for traditional mode', () => {
      const result = getDisplayCharacter(mockCharacter, 'traditional')
      expect(result).toEqual({ simplified: '们', traditional: '' })
    })
  })

  describe('getRandomCharacterIndex', () => {
    it('returns index within mode-specific limit', () => {
      const result = getRandomCharacterIndex('pinyin', 4)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(4)
    })

    it('caps to mode-specific maximum', () => {
      const result = getRandomCharacterIndex('simplified', 10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(3) // Only 3 characters have different simplified/traditional
    })
  })

  describe('getCharacterAtIndex', () => {
    it('returns character from filtered list for simplified mode', () => {
      const character = getCharacterAtIndex(0, 'simplified')
      expect(character).toEqual({ simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' })
    })

    it('returns character from filtered list for traditional mode', () => {
      const character = getCharacterAtIndex(0, 'traditional')
      expect(character).toEqual({ simplified: '们', traditional: '們', pinyin: 'men', english: 'plural' })
    })

    it('returns character from full list for pinyin mode', () => {
      const character = getCharacterAtIndex(0, 'pinyin')
      expect(character).toEqual({ simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' })
    })

    it('returns null for out of bounds index', () => {
      const character = getCharacterAtIndex(10, 'simplified')
      expect(character).toBeNull()
    })
  })
}) 
