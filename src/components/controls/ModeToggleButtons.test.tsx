import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ModeToggleButtons } from './ModeToggleButtons';
import { FlashcardMode } from '../../types';

describe('ModeToggleButtons', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('renders all three mode buttons', () => {
    render(<ModeToggleButtons currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    expect(screen.getByText('全部 (F1)')).toBeInTheDocument();
    expect(screen.getByText('简体 (F2)')).toBeInTheDocument();
    expect(screen.getByText('繁体 (F3)')).toBeInTheDocument();
  });

  it('renders the mode title', () => {
    render(<ModeToggleButtons currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    expect(screen.getByText('Flashcard Mode')).toBeInTheDocument();
  });

  it('highlights the current mode button', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.SIMPLIFIED} onModeChange={mockOnModeChange} />
    );

    const simplifiedButton = screen.getByText('简体 (F2)');
    expect(simplifiedButton).toHaveClass(/bg-primary/);
  });

  it('calls onModeChange when a different mode is clicked', () => {
    render(<ModeToggleButtons currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
  });

  it('does not call onModeChange when the current mode is clicked', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.TRADITIONAL} onModeChange={mockOnModeChange} />
    );

    const traditionalButton = screen.getByText('繁体 (F3)');
    fireEvent.click(traditionalButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(<ModeToggleButtons currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    // Check that buttons have aria-label for accessibility
    const bothButton = screen.getByText('全部 (F1)');
    expect(bothButton).toHaveAttribute('aria-label', '显示全部字符 - Show Both Characters (F1)');

    const simplifiedButton = screen.getByText('简体 (F2)');
    expect(simplifiedButton).toHaveAttribute(
      'aria-label',
      '仅显示简体 - Show Simplified Only (F2)'
    );

    const traditionalButton = screen.getByText('繁体 (F3)');
    expect(traditionalButton).toHaveAttribute(
      'aria-label',
      '仅显示繁体 - Show Traditional Only (F3)'
    );
  });
});
