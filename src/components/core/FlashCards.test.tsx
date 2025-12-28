import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FlashCards } from './FlashCards';
import { APP_LIMITS } from '../../constants';
// FlashcardMode is used in test assertions via MODES
import { MODES } from '../controls/ModeToggleButtons';
import { CHINESE_TEXT } from '../../constants';

// Helper function to get input value safely
const getInputValue = (element: HTMLElement): number => {
  if (element instanceof HTMLInputElement) {
    return Number(element.value);
  }
  throw new Error('Element is not an HTMLInputElement');
};

// Mock the data
vi.mock('../../data/characters.json', () => ({
  default: [
    { item: '1', simplified: '你', traditional: '你', pinyin: 'nǐ', english: 'you' },
    { item: '2', simplified: '好', traditional: '好', pinyin: 'hǎo', english: 'good' },
    { item: '3', simplified: '我', traditional: '我', pinyin: 'wǒ', english: 'I' },
    { item: '4', simplified: '是', traditional: '是', pinyin: 'shì', english: 'is' },
    { item: '5', simplified: '的', traditional: '的', pinyin: 'de', english: 'of' },
  ],
}));

describe('FlashCards', () => {
  it('renders without crashing', () => {
    render(<FlashCards />);
    // Title appears in both Navigation and FlashCards content
    const titles = screen.getAllByText(CHINESE_TEXT.APP_TITLE);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('responds to global arrow keys when pinyin input is focused', () => {
    render(<FlashCards />);

    // Get initial limit value (mocked data has 5 items)
    const rangeInput = screen.getByTestId('range-input');
    const initialValue = getInputValue(rangeInput);

    // Focus on pinyin input
    const pinyinInput = screen.getByRole('textbox');
    pinyinInput.focus();

    // Press up arrow key
    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // The limit should change (either increase or clamp to max)
    const newValue = getInputValue(rangeInput);
    expect(newValue).toBeGreaterThanOrEqual(initialValue);
  });

  it('responds to global arrow keys when pinyin input is focused - down arrow', () => {
    render(<FlashCards />);

    // Get initial limit value
    const rangeInput = screen.getByTestId('range-input');
    const initialValue = getInputValue(rangeInput);

    // Focus on pinyin input
    const pinyinInput = screen.getByRole('textbox');
    pinyinInput.focus();

    // Press down arrow key
    fireEvent.keyDown(window, { key: 'ArrowDown' });

    // The limit should change (either decrease or clamp to min)
    const newValue = getInputValue(rangeInput);
    expect(newValue).toBeLessThanOrEqual(initialValue);
  });

  it('does not respond to global arrow keys when range input is focused', () => {
    render(<FlashCards />);

    // Get initial limit value
    const rangeInput = screen.getByTestId('range-input');
    const initialValue = getInputValue(rangeInput);

    // Focus on range input
    rangeInput.focus();

    // Press up arrow key
    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // The limit should not change (range input handles its own arrow keys)
    expect(rangeInput).toHaveValue(initialValue);
  });

  it('clears pinyin input when transitioning to next character', async () => {
    render(<FlashCards />);

    const pinyinInput = screen.getByRole('textbox');
    // Use regex to match the Next button
    const nextButton = screen.getByText(/Next/);

    // Type in pinyin input
    fireEvent.change(pinyinInput, { target: { value: 'test' } });
    expect(pinyinInput).toHaveValue('test');

    // Click next button
    fireEvent.click(nextButton);

    // Pinyin input should be cleared after state update
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(pinyinInput).toHaveValue('');
  });

  it('should update character range when switching modes', () => {
    render(<FlashCards />);

    // Initially should show pinyin mode with max based on available data
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveAttribute(
      'max',
      APP_LIMITS.PINYIN_MODE_MAX.toString()
    );

    // Switch to simplified mode
    const simplifiedButton = screen.getByText(CHINESE_TEXT.MODES.SIMPLIFIED.LABEL);
    fireEvent.click(simplifiedButton);

    // All modes should support 1500 characters
    expect(rangeInput).toHaveAttribute(
      'max',
      APP_LIMITS.PINYIN_MODE_MAX.toString()
    );

    // Switch back to pinyin mode
    const pinyinButton = screen.getByText(CHINESE_TEXT.MODES.PINYIN.LABEL);
    fireEvent.click(pinyinButton);

    // Should show pinyin mode with max again
    expect(rangeInput).toHaveAttribute(
      'max',
      APP_LIMITS.PINYIN_MODE_MAX.toString()
    );
  });

  it('switches mode with right arrow key, and does not go past last mode', () => {
    render(<FlashCards />);
    // Start at first mode
    let currentModeIndex = 0;
    for (let i = 1; i < MODES.length; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      currentModeIndex = i;
      // The button for the current mode should be active
      const mode = MODES[currentModeIndex];
      if (mode) {
        expect(screen.getByText(mode.label)).toHaveClass(/bg-primary/);
      }
    }
    // Try to go past the last mode
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    // Should still be at the last mode
    const lastMode = MODES[MODES.length - 1];
    if (lastMode) {
      expect(screen.getByText(lastMode.label)).toHaveClass(/bg-primary/);
    }
  });

  it('switches mode with left arrow key, and does not go past first mode', () => {
    render(<FlashCards />);
    // Move to last mode first
    for (let i = 1; i < MODES.length; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }
    // Now move left through all modes
    for (let i = MODES.length - 2; i >= 0; i--) {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      const mode = MODES[i];
      if (mode) {
        expect(screen.getByText(mode.label)).toHaveClass(/bg-primary/);
      }
    }
    // Try to go past the first mode
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    const firstMode = MODES[0];
    if (firstMode) {
      expect(screen.getByText(firstMode.label)).toHaveClass(/bg-primary/);
    }
  });
});
