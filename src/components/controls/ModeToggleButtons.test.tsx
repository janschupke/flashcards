import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ModeToggleButtons } from './ModeToggleButtons';
import { FlashcardMode } from '../../types';
import { CHINESE_TEXT } from '../../constants';

describe('ModeToggleButtons', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('renders all three mode buttons', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />
    );

    expect(screen.getByText(CHINESE_TEXT.MODES.PINYIN.LABEL)).toBeInTheDocument();
    expect(screen.getByText(CHINESE_TEXT.MODES.SIMPLIFIED.LABEL)).toBeInTheDocument();
    expect(screen.getByText(CHINESE_TEXT.MODES.TRADITIONAL.LABEL)).toBeInTheDocument();
  });

  it('renders the mode title', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />
    );

    expect(screen.getByText('Flashcard Mode')).toBeInTheDocument();
  });

  it('highlights the current mode button', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.SIMPLIFIED} onModeChange={mockOnModeChange} />
    );

    const simplifiedButton = screen.getByText(CHINESE_TEXT.MODES.SIMPLIFIED.LABEL);
    expect(simplifiedButton).toHaveClass(/bg-primary/);
  });

  it('calls onModeChange when a different mode is clicked', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />
    );

    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
  });

  it('does not call onModeChange when the current mode is clicked', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.TRADITIONAL} onModeChange={mockOnModeChange} />
    );

    const traditionalButton = screen.getByText(CHINESE_TEXT.MODES.TRADITIONAL.LABEL);
    fireEvent.click(traditionalButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <ModeToggleButtons currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />
    );

    const pinyinButton = screen.getByText(CHINESE_TEXT.MODES.PINYIN.LABEL);
    expect(pinyinButton).toHaveAttribute('title', CHINESE_TEXT.MODES.PINYIN.TITLE);

    const simplifiedButton = screen.getByText(CHINESE_TEXT.MODES.SIMPLIFIED.LABEL);
    expect(simplifiedButton).toHaveAttribute('title', CHINESE_TEXT.MODES.SIMPLIFIED.TITLE);

    const traditionalButton = screen.getByText(CHINESE_TEXT.MODES.TRADITIONAL.LABEL);
    expect(traditionalButton).toHaveAttribute('title', CHINESE_TEXT.MODES.TRADITIONAL.TITLE);
  });
});
