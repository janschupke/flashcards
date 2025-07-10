import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ModeToggleButtons } from './ModeToggleButtons';

describe('ModeToggleButtons', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('renders all three mode buttons', () => {
    render(
      <ModeToggleButtons
        currentMode="pinyin"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('拼音 (F1)')).toBeInTheDocument();
    expect(screen.getByText('简体 (F2)')).toBeInTheDocument();
    expect(screen.getByText('繁体 (F3)')).toBeInTheDocument();
  });

  it('renders the mode title', () => {
    render(
      <ModeToggleButtons
        currentMode="pinyin"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('Flashcard Mode')).toBeInTheDocument();
  });

  it('highlights the current mode button', () => {
    render(
      <ModeToggleButtons
        currentMode="simplified"
        onModeChange={mockOnModeChange}
      />
    );

    const simplifiedButton = screen.getByText('简体 (F2)');
    expect(simplifiedButton).toHaveStyle('background-color: rgb(220, 38, 38)');
  });

  it('calls onModeChange when a different mode is clicked', () => {
    render(
      <ModeToggleButtons
        currentMode="pinyin"
        onModeChange={mockOnModeChange}
      />
    );

    const simplifiedButton = screen.getByText('简体 (F2)');
    fireEvent.click(simplifiedButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('simplified');
  });

  it('does not call onModeChange when the current mode is clicked', () => {
    render(
      <ModeToggleButtons
        currentMode="traditional"
        onModeChange={mockOnModeChange}
      />
    );

    const traditionalButton = screen.getByText('繁体 (F3)');
    fireEvent.click(traditionalButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <ModeToggleButtons
        currentMode="pinyin"
        onModeChange={mockOnModeChange}
      />
    );

    const pinyinButton = screen.getByText('拼音 (F1)');
    expect(pinyinButton).toHaveAttribute('title', '拼音模式 - Pinyin Mode (F1)');

    const simplifiedButton = screen.getByText('简体 (F2)');
    expect(simplifiedButton).toHaveAttribute('title', '简体模式 - Simplified Mode (F2)');

    const traditionalButton = screen.getByText('繁体 (F3)');
    expect(traditionalButton).toHaveAttribute('title', '繁体模式 - Traditional Mode (F3)');
  });
}); 
