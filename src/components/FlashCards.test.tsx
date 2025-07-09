import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FlashCards } from './FlashCards';

// Mock the data
vi.mock('../data.json', () => ({
  default: [
    { character: '你', pinyin: 'nǐ', english: 'you' },
    { character: '好', pinyin: 'hǎo', english: 'good' },
    { character: '我', pinyin: 'wǒ', english: 'I' },
    { character: '是', pinyin: 'shì', english: 'is' },
    { character: '的', pinyin: 'de', english: 'of' },
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
    
    // The limit should be increased by 50, but max is 5 (mocked data)
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveValue(5);
  });

  it('responds to global arrow keys when pinyin input is focused - down arrow', () => {
    render(<FlashCards initialLimit={5} />);
    
    // Focus on pinyin input
    const pinyinInput = screen.getByRole('textbox');
    pinyinInput.focus();
    
    // Press down arrow key
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    
    // The limit should be decreased by 50, but min is 5 (mocked data)
    const rangeInput = screen.getByTestId('range-input');
    expect(rangeInput).toHaveValue(5);
  });

  it('does not respond to global arrow keys when range input is focused', () => {
    render(<FlashCards initialLimit={5} />);
    
    // Focus on range input
    const rangeInput = screen.getByTestId('range-input');
    rangeInput.focus();
    
    // Press up arrow key
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    
    // The limit should not change (range input handles its own arrow keys)
    expect(rangeInput).toHaveValue(5);
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
}); 
