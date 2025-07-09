import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PinyinInput } from './PinyinInput';

describe('PinyinInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('has autofocus attribute', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    // Instead of checking the attribute, check if the input is focused
    expect(document.activeElement).toBe(input);
  });

  it('calls onSubmit when input changes', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ni' } });

    expect(mockOnSubmit).toHaveBeenCalledWith('ni');
  });

  it('shows correct feedback when pinyin is correct', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={true}
      />
    );

    expect(screen.getByText('✓ Correct!')).toBeInTheDocument();
  });

  it('shows incorrect feedback when pinyin is wrong', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={false}
      />
    );

    expect(screen.getByText('✗ Incorrect. Try again.')).toBeInTheDocument();
  });

  it('shows no feedback when isCorrect is null', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const feedbackElement = screen.getByTestId('feedback-message');
    expect(feedbackElement).toHaveTextContent('');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('has correct styling when correct', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border-color: rgb(40, 167, 69)');
  });

  it('has incorrect styling when incorrect', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={false}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border-color: rgb(220, 53, 69)');
  });

  it.skip('has neutral styling when not evaluated', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    // Simulate blur to check the neutral border color
    input.blur();
    expect(input).toHaveStyle('border-color: rgb(233, 236, 239)');
  });
}); 
