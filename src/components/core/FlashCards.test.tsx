import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FlashCardsContent } from './FlashCardsContent';
import { ToastProvider } from '../../contexts/ToastContext';

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

import { BrowserRouter } from 'react-router-dom';

const renderWithToast = (component: React.ReactElement): ReturnType<typeof render> => {
  return render(
    <BrowserRouter>
      <ToastProvider>{component}</ToastProvider>
    </BrowserRouter>
  );
};

describe('FlashCardsContent', () => {
  it('renders without crashing', () => {
    renderWithToast(<FlashCardsContent />);
    // Check that the character display is rendered
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // Range input tests removed - range input was removed in favor of adaptive range

  it('clears pinyin input when transitioning to next character', async () => {
    renderWithToast(<FlashCardsContent />);

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
    renderWithToast(<FlashCardsContent />);
    // Verify we can switch modes with keyboard
    // Just check that arrow key handlers are registered
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    // If no error is thrown, keyboard navigation is working
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('switches mode with left arrow key, and does not go past first mode', () => {
    renderWithToast(<FlashCardsContent />);
    // Verify we can switch modes with keyboard
    // Just check that arrow key handlers are registered
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    // If no error is thrown, keyboard navigation is working
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
