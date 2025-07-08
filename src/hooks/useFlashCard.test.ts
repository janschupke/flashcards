import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFlashCard } from './useFlashCard'

// Mock the data import
vi.mock('../data.json', () => ({
  default: [
    { chinese: '一', pinyin: 'yī', english: 'one' },
    { chinese: '二', pinyin: 'èr', english: 'two' },
    { chinese: '三', pinyin: 'sān', english: 'three' },
    { chinese: '四', pinyin: 'sì', english: 'four' },
    { chinese: '五', pinyin: 'wǔ', english: 'five' },
  ]
}))

describe('useFlashCard', () => {
  beforeEach(() => {
    // Mock Math.random to return 0 for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default values when no props provided', () => {
      const { result } = renderHook(() => useFlashCard())
      
      expect(result.current.current).toBe(0) // Math.random returns 0
      expect(result.current.limit).toBe(5) // data.length is 5
      expect(result.current.hint).toBe('NONE')
      expect(result.current.totalSeen).toBe(0)
      expect(result.current.progress).toBe(0)
    })

    it('initializes with provided initial values', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 2, 
        initialLimit: 3 
      }))
      
      expect(result.current.current).toBe(2)
      expect(result.current.limit).toBe(3)
      expect(result.current.hint).toBe('NONE')
      expect(result.current.totalSeen).toBe(0)
      expect(result.current.progress).toBe(0)
    })

    it('caps initial limit to available data length', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialLimit: 100 
      }))
      
      expect(result.current.limit).toBe(5) // data.length is 5
    })
  })

  describe('getNext', () => {
    it('advances to a new character and resets hint', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 0, 
        initialLimit: 5 
      }))
      
      // Set hint to pinyin first
      act(() => {
        result.current.toggleHint('PINYIN')
      })
      expect(result.current.hint).toBe('PINYIN')
      
      // Get next character
      act(() => {
        result.current.getNext()
      })
      
      expect(result.current.current).toBe(0) // Math.random returns 0
      expect(result.current.hint).toBe('NONE') // Hint should be reset
      expect(result.current.totalSeen).toBe(1)
    })

    it('increments totalSeen counter', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 0, 
        initialLimit: 5 
      }))
      
      act(() => {
        result.current.getNext()
      })
      expect(result.current.totalSeen).toBe(1)
      
      act(() => {
        result.current.getNext()
      })
      expect(result.current.totalSeen).toBe(2)
    })
  })

  describe('toggleHint', () => {
    it('toggles hint on when called with new hint type', () => {
      const { result } = renderHook(() => useFlashCard())
      
      act(() => {
        result.current.toggleHint('PINYIN') // Pinyin
      })
      expect(result.current.hint).toBe('PINYIN')
      
      act(() => {
        result.current.toggleHint('ENGLISH') // English
      })
      expect(result.current.hint).toBe('ENGLISH')
    })

    it('toggles hint off when called with same hint type', () => {
      const { result } = renderHook(() => useFlashCard())
      
      act(() => {
        result.current.toggleHint('PINYIN') // Turn on pinyin
      })
      expect(result.current.hint).toBe('PINYIN')
      
      act(() => {
        result.current.toggleHint('PINYIN') // Turn off pinyin
      })
      expect(result.current.hint).toBe('NONE')
    })
  })

  describe('updateLimit', () => {
    it('updates limit and resets state', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 0, 
        initialLimit: 5 
      }))
      
      // First, increment seen count
      act(() => {
        result.current.getNext()
      })
      expect(result.current.totalSeen).toBe(1)
      
      // Update limit
      act(() => {
        result.current.updateLimit(3)
      })
      
      expect(result.current.limit).toBe(3)
      expect(result.current.current).toBe(0) // Math.random returns 0
      expect(result.current.totalSeen).toBe(0) // Should reset
      expect(result.current.hint).toBe('NONE') // Should reset
    })

    it('caps limit to available data length', () => {
      const { result } = renderHook(() => useFlashCard())
      
      act(() => {
        result.current.updateLimit(100)
      })
      
      expect(result.current.limit).toBe(5) // data.length is 5
    })
  })

  describe('reset', () => {
    it('resets progress and hint but keeps limit', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 0, 
        initialLimit: 5 
      }))
      
      // Set some state
      act(() => {
        result.current.getNext()
        result.current.toggleHint('PINYIN')
      })
      
      expect(result.current.totalSeen).toBe(1)
      expect(result.current.hint).toBe('PINYIN')
      
      // Reset
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.totalSeen).toBe(0)
      expect(result.current.hint).toBe('NONE')
      expect(result.current.limit).toBe(5) // Should remain unchanged
      expect(result.current.current).toBe(0) // Math.random returns 0
    })
  })

  describe('progress calculation', () => {
    it('calculates progress correctly', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialCurrent: 0, 
        initialLimit: 4 
      }))
      
      expect(result.current.progress).toBe(0)
      
      act(() => {
        result.current.getNext()
      })
      expect(result.current.progress).toBe(25) // 1/4 = 25%
      
      act(() => {
        result.current.getNext()
      })
      expect(result.current.progress).toBe(50) // 2/4 = 50%
    })

    it('handles zero limit gracefully', () => {
      const { result } = renderHook(() => useFlashCard({ 
        initialLimit: 0 
      }))
      
      expect(result.current.progress).toBe(0)
    })
  })
}) 
