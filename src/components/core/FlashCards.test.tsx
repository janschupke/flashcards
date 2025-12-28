import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FlashCards } from './FlashCards';
import { ToastProvider } from '../../contexts/ToastContext';
// FlashcardMode is used in test assertions via MODES
import { MODES } from '../../constants/modes';
import { CHINESE_TEXT } from '../../constants';

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

const renderWithToast = (component: React.ReactElement): ReturnType<typeof render> => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('FlashCards', () => {
  it('renders without crashing', () => {
    renderWithToast(<FlashCards />);
    // Title appears in both Navigation and FlashCards content
    const titles = screen.getAllByText(CHINESE_TEXT.APP_TITLE);
    expect(titles.length).toBeGreaterThan(0);
  });

  // Range input tests removed - range input was removed in favor of adaptive range

  it('clears pinyin input when transitioning to next character', async () => {
    renderWithToast(<FlashCards />);

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

  it('switches mode with right arrow key, and does not go past last mode', () => {
    renderWithToast(<FlashCards />);
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
    renderWithToast(<FlashCards />);
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
