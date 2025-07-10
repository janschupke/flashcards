import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ModeToggleButtons } from './ModeToggleButtons';
import { FlashcardMode } from '../types';

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

    expect(screen.getByText('拼音')).toBeInTheDocument();
    expect(screen.getByText('简体')).toBeInTheDocument();
    expect(screen.getByText('繁体')).toBeInTheDocument();
  });

  it('highlights the current mode button', () => {
    render(
      <ModeToggleButtons
        currentMode="simplified"
        onModeChange={mockOnModeChange}
      />
    );

    const simplifiedButton = screen.getByText('简体');
    expect(simplifiedButton).toHaveStyle('background-color: rgb(220, 38, 38)');
  });

  it('calls onModeChange when a different mode is clicked', () => {
    render(
      <ModeToggleButtons
        currentMode="pinyin"
        onModeChange={mockOnModeChange}
      />
    );

    const simplifiedButton = screen.getByText('简体');
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

    const traditionalButton = screen.getByText('繁体');
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

    const pinyinButton = screen.getByText('拼音');
    expect(pinyinButton).toHaveAttribute('title', '拼音模式 - Pinyin Mode (1)');

    const simplifiedButton = screen.getByText('简体');
    expect(simplifiedButton).toHaveAttribute('title', '简体模式 - Simplified Mode (2)');

    const traditionalButton = screen.getByText('繁体');
    expect(traditionalButton).toHaveAttribute('title', '繁体模式 - Traditional Mode (3)');
  });
}); 
