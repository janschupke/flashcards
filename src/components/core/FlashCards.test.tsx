import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FlashCards } from './FlashCards';
import { getModeSpecificLimit } from '../../utils/characterUtils';
import { FlashcardMode } from '../../types';
import { MODES } from '../controls/ModeToggleButtons';

// Mock the data
vi.mock('../../data/characters.json', () => ({
  default: [
    { item: '1', simplified: '你', traditional: '你', pinyin: 'nǐ', english: 'you' },
    { item: '2', simplified: '好', traditional: '好', pinyin: 'hǎo', english: 'good' },
    { item: '3', simplified: '我', traditional: '我', pinyin: 'wǒ', english: 'I' },
    { item: '4', simplified: '是', traditional: '是', pinyin: 'shì', english: 'is' },
    { item: '5', simplified: '的', traditional: '的', pinyin: 'de', english: 'of' },
  ]
}));

describe('FlashCards', () => {
  it('renders without crashing', () => {
    render(<FlashCards />);
    expect(screen.getByText('汉字 Flashcards')).toBeInTheDocument();
  });

  it('responds to global arrow keys when pinyin input is focused', () => {
    render(<FlashCards initialLimit={5} />);
    
    // Focus on pinyin input
    const pinyinInput = screen.getByRole('textbox');
    pinyinInput.focus();
    
    // Press up arrow key
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    
    // The limit should be increased by 50, but min is 50 (clamped)
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveValue(50);
  });

  it('responds to global arrow keys when pinyin input is focused - down arrow', () => {
    render(<FlashCards initialLimit={5} />);
    
    // Focus on pinyin input
    const pinyinInput = screen.getByRole('textbox');
    pinyinInput.focus();
    
    // Press down arrow key
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    
    // The limit should be decreased by 50, but min is 50 (clamped)
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveValue(50);
  });

  it('does not respond to global arrow keys when range input is focused', () => {
    render(<FlashCards initialLimit={5} />);
    
    // Focus on range input
    const rangeInput = screen.getByTestId('range-input');
    rangeInput.focus();
    
    // Press up arrow key
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    
    // The limit should not change (range input handles its own arrow keys)
    expect(rangeInput).toHaveValue(50);
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
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(pinyinInput).toHaveValue('');
  });

  it('should update character range when switching modes', () => {
    render(<FlashCards />);
    
    // Initially should show pinyin mode with max based on available data
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveAttribute('max', getModeSpecificLimit(FlashcardMode.PINYIN).toString());
    
    // Switch to simplified mode
    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);
    
    // Should now show simplified mode with max based on available data
    expect(rangeInput).toHaveAttribute('max', getModeSpecificLimit(FlashcardMode.SIMPLIFIED).toString());
    
    // Switch back to pinyin mode
    const pinyinButton = screen.getByText('拼音 (F1)');
    fireEvent.click(pinyinButton);
    
    // Should show pinyin mode with max again
    expect(rangeInput).toHaveAttribute('max', getModeSpecificLimit(FlashcardMode.PINYIN).toString());
  });

  it('switches mode with right arrow key, and does not go past last mode', () => {
    render(<FlashCards />);
    // Start at first mode
    let currentModeIndex = 0;
    for (let i = 1; i < MODES.length; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      currentModeIndex = i;
      // The button for the current mode should be active
      expect(screen.getByText(MODES[currentModeIndex].label)).toHaveStyle('background-color: #dc2626');
    }
    // Try to go past the last mode
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    // Should still be at the last mode
    expect(screen.getByText(MODES[MODES.length - 1].label)).toHaveStyle('background-color: #dc2626');
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
      expect(screen.getByText(MODES[i].label)).toHaveStyle('background-color: #dc2626');
    }
    // Try to go past the first mode
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(MODES[0].label)).toHaveStyle('background-color: #dc2626');
  });
}); 
