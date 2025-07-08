import { describe, it, expect, vi } from 'vitest'
import { getCharacterByIndex, getHintText, validateLimit, getRandomIndex } from './characterUtils'
import { HINT_TYPES } from '../types'

// Mock the data import
vi.mock('../output.json', () => ({
  default: [
    { chinese: '一', pinyin: 'yī', english: 'one' },
    { chinese: '二', pinyin: 'èr', english: 'two' },
    { chinese: '三', pinyin: 'sān', english: 'three' },
  ]
}))

describe('characterUtils', () => {
  describe('getCharacterByIndex', () => {
    it('returns character at valid index', () => {
      const character = getCharacterByIndex(1)
      expect(character).toEqual({ chinese: '二', pinyin: 'èr', english: 'two' })
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
    const mockCharacter = { chinese: '一', pinyin: 'yī', english: 'one' }

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
      const text = getHintText(mockCharacter, 99 as any)
      expect(text).toBe('?')
    })

    it('returns fallback when character is null', () => {
      const text = getHintText(null, HINT_TYPES.PINYIN)
      expect(text).toBe('?')
    })
  })

  describe('validateLimit', () => {
    it('returns parsed number for valid input', () => {
      expect(validateLimit('5', 10)).toBe(5)
      expect(validateLimit('10', 10)).toBe(10)
    })

    it('caps value to maximum available', () => {
      expect(validateLimit('15', 10)).toBe(10)
    })

    it('returns default for invalid input', () => {
      expect(validateLimit('abc', 10)).toBe(10)
      expect(validateLimit('', 10)).toBe(10)
    })

    it('returns default for zero or negative input', () => {
      expect(validateLimit('0', 10)).toBe(10)
      expect(validateLimit('-5', 10)).toBe(10)
    })

    it('handles edge case where max is smaller than default', () => {
      expect(validateLimit('abc', 5)).toBe(5)
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
}) 
