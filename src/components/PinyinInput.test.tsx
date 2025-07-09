import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PinyinInput } from './PinyinInput';

describe('PinyinInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render input field and submit button', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByPlaceholderText('Enter pinyin...')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should show current pinyin in instructions', () => {
    render(
      <PinyinInput
        currentPinyin="nǐ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByText(/Type the pinyin.*nǐ/)).toBeInTheDocument();
  });

  it('should call onSubmit when submit button is clicked', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByPlaceholderText('Enter pinyin...');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(input, { target: { value: 'wo' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('wo');
  });

  it('should call onSubmit when Enter key is pressed', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByPlaceholderText('Enter pinyin...');
    
    fireEvent.change(input, { target: { value: 'wo' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('wo');
  });

  it('should show correct feedback when isCorrect is true', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={true}
      />
    );

    expect(screen.getByText('✓ Correct!')).toBeInTheDocument();
  });

  it('should show incorrect feedback when isCorrect is false', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={false}
      />
    );

    expect(screen.getByText('✗ Incorrect. Try again.')).toBeInTheDocument();
  });

  it('should show default message when isCorrect is null', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByText('Enter the pinyin for this character')).toBeInTheDocument();
  });

  it('should disable submit button when input is empty', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when input has value', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByPlaceholderText('Enter pinyin...');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(input, { target: { value: 'wo' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <PinyinInput
        currentPinyin="wǒ"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('Enter pinyin...');
    const submitButton = screen.getByText('Submit');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
}); 
