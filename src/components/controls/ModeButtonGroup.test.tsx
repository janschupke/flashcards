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
    render(<ModeButtonGroup currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    expect(screen.getByText('全部 (F1)')).toBeInTheDocument();
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
    render(<ModeButtonGroup currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);

    expect(mockOnModeChange).toHaveBeenCalledWith(FlashcardMode.SIMPLIFIED);
  });

  it('does not call onModeChange when current mode is clicked', () => {
    render(<ModeButtonGroup currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

    const bothButton = screen.getByText('全部 (F1)');
    fireEvent.click(bothButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('applies custom size prop', () => {
    const { container } = render(
      <ModeButtonGroup
        currentMode={FlashcardMode.BOTH}
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
        currentMode={FlashcardMode.BOTH}
        onModeChange={mockOnModeChange}
        className="custom-class"
      />
    );

    const buttonGroup = container.querySelector('.flex.gap-1');
    expect(buttonGroup).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<ModeButtonGroup currentMode={FlashcardMode.BOTH} onModeChange={mockOnModeChange} />);

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
