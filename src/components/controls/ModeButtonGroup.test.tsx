import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModeButtonGroup } from './ModeButtonGroup';
import { FlashcardMode } from '../../types';
import { ButtonSize } from '../../types/components';

describe('ModeButtonGroup', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all mode buttons', () => {
    render(<ModeButtonGroup currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />);

    expect(screen.getByText('拼音 (F1)')).toBeInTheDocument();
    expect(screen.getByText('简体 (F2)')).toBeInTheDocument();
    expect(screen.getByText('繁体 (F3)')).toBeInTheDocument();
  });

  it('highlights current mode with primary variant', () => {
    render(
      <ModeButtonGroup currentMode={FlashcardMode.SIMPLIFIED} onModeChange={mockOnModeChange} />
    );

    const simplifiedButton = screen.getByText('简体 (F2)').closest('button');
    expect(simplifiedButton).toHaveClass('bg-primary');
  });

  it('calls onModeChange when a different mode is clicked', () => {
    render(<ModeButtonGroup currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />);

    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
  });

  it('does not call onModeChange when current mode is clicked', () => {
    render(<ModeButtonGroup currentMode={FlashcardMode.PINYIN} onModeChange={mockOnModeChange} />);

    const pinyinButton = screen.getByText('拼音 (F1)');
    fireEvent.click(pinyinButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('applies custom size prop', () => {
    const { container } = render(
      <ModeButtonGroup
        currentMode={FlashcardMode.PINYIN}
        onModeChange={mockOnModeChange}
        size={ButtonSize.SM}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      expect(button).toHaveClass('text-xs');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <ModeButtonGroup
        currentMode={FlashcardMode.PINYIN}
        onModeChange={mockOnModeChange}
        className="custom-class"
      />
    );

    const buttonGroup = container.querySelector('.flex.gap-1');
    expect(buttonGroup).toHaveClass('custom-class');
  });
});
