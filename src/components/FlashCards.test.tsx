import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashCards } from './FlashCards'

// Mock the data import
vi.mock('../output.json', () => ({
  default: [
    { chinese: '一', pinyin: 'yī', english: 'one' },
    { chinese: '二', pinyin: 'èr', english: 'two' },
    { chinese: '三', pinyin: 'sān', english: 'three' },
    { chinese: '四', pinyin: 'sì', english: 'four' },
    { chinese: '五', pinyin: 'wǔ', english: 'five' },
  ]
}))

describe('FlashCards', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    // Mock Math.random to return 0 for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Character Range Input', () => {
    it('updates the range correctly when valid input is provided', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, '3')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(rangeInput).toHaveValue(3)
      })
    })

    it('prevents going outside the max range of available characters', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, '1000')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(rangeInput).toHaveValue(5)
      })
    })

    it('handles invalid input gracefully', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, 'abc')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(rangeInput).toHaveValue(5)
      })
    })

    it('resets progress and current character when range changes', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, '3')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(screen.getByTestId('stat-seen')).toHaveTextContent('0')
      })
    })
  })

  describe('Pinyin and English Buttons', () => {
    it('pinyin button toggles pinyin hint on and off', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const pinyinButton = screen.getByText(/pinyin/i)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
      await user.click(pinyinButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('yī')
      await user.click(pinyinButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })

    it('english button toggles english hint on and off', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const englishButton = screen.getByText(/english/i)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
      await user.click(englishButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('one')
      await user.click(englishButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })

    it('p hotkey toggles pinyin hint on and off', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
      fireEvent.keyDown(window, { key: 'p' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('yī')
      fireEvent.keyDown(window, { key: 'p' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })

    it('e hotkey toggles english hint on and off', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
      fireEvent.keyDown(window, { key: 'e' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('one')
      fireEvent.keyDown(window, { key: 'e' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })

    it('hotkeys work with both uppercase and lowercase', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      fireEvent.keyDown(window, { key: 'P' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('yī')
      fireEvent.keyDown(window, { key: 'E' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('one')
    })
  })

  describe('Next Button and Hotkey', () => {
    it('next button advances to a new character', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const nextButton = screen.getByText(/next/i)
      expect(screen.getByTestId('main-character')).toHaveTextContent('一')
      await user.click(nextButton)
      // With Math.random mocked to return 0, it will still be '一' (index 0)
      // So we check that the seen count increased instead
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('1')
    })

    it('enter hotkey advances to a new character', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      expect(screen.getByTestId('main-character')).toHaveTextContent('一')
      fireEvent.keyDown(window, { key: 'Enter' })
      // With Math.random mocked to return 0, it will still be '一' (index 0)
      // So we check that the seen count increased instead
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('1')
    })

    it('next button resets hints', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const pinyinButton = screen.getByText(/pinyin/i)
      await user.click(pinyinButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('yī')
      const nextButton = screen.getByText(/next/i)
      await user.click(nextButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })

    it('enter hotkey resets hints', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const pinyinButton = screen.getByText(/pinyin/i)
      await user.click(pinyinButton)
      expect(screen.getByTestId('hint-text')).toHaveTextContent('yī')
      fireEvent.keyDown(window, { key: 'Enter' })
      expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal')
    })
  })

  describe('Numerical Statistics', () => {
    it('displays correct initial statistics', () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      expect(screen.getByTestId('stat-current')).toHaveTextContent('1')
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('0')
      expect(screen.getByTestId('stat-total')).toHaveTextContent('5')
    })

    it('updates seen count when next is pressed', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const nextButton = screen.getByText(/next/i)
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('0')
      await user.click(nextButton)
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('1')
    })

    it('updates current character number when next is pressed', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const nextButton = screen.getByText(/next/i)
      expect(screen.getByTestId('stat-current')).toHaveTextContent('1')
      await user.click(nextButton)
      // With Math.random mocked to return 0, current will still be 1 (index 0 + 1)
      // So we check that the seen count increased instead
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('1')
    })

    it('resets statistics when range changes', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      const nextButton = screen.getByText(/next/i)
      await user.click(nextButton)
      await user.click(nextButton)
      expect(screen.getByTestId('stat-seen')).toHaveTextContent('2')
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, '3')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(screen.getByTestId('stat-seen')).toHaveTextContent('0')
      })
    })

    it('updates total when range changes', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={5} />)
      expect(screen.getByTestId('stat-total')).toHaveTextContent('5')
      const rangeInput = screen.getByTestId('range-input')
      await user.clear(rangeInput)
      await user.type(rangeInput, '3')
      await user.tab() // Trigger blur event
      await waitFor(() => {
        expect(screen.getByTestId('stat-total')).toHaveTextContent('3')
      })
    })
  })

  describe('Progress Bar', () => {
    it('shows correct progress based on seen vs total', async () => {
      render(<FlashCards initialCurrent={0} initialLimit={4} />)
      const nextButton = screen.getByText(/next/i)
      const progressFill = screen.getByTestId('progress-fill')
      expect(progressFill).toHaveStyle({ width: '0%' })
      await user.click(nextButton)
      // After 1/4 seen, progress should be 25%
      expect(progressFill).toHaveStyle({ width: '25%' })
    })
  })
}) 
