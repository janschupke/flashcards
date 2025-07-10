import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterInput } from './CharacterInput';
import { FlashcardMode } from '../types';

describe('CharacterInput', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders with correct label for simplified mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="simplified"
      />
    );

    expect(screen.getByText('请输入简体字')).toBeInTheDocument();
  });

  it('renders with correct label for traditional mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="們"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="traditional"
      />
    );

    expect(screen.getByText('请输入繁体字')).toBeInTheDocument();
  });

  it('shows correct placeholder for simplified mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="simplified"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', '输入简体字');
  });

  it('shows correct placeholder for traditional mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="們"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="traditional"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', '输入繁体字');
  });

  it('calls onChange when input changes', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="simplified"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '们' } });

    expect(mockOnChange).toHaveBeenCalledWith('们');
  });

  it('calls onSubmit when Enter is pressed', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="simplified"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '们' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('们');
  });

  it('shows correct feedback when answer is correct', () => {
    render(
      <CharacterInput
        value="们"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={true}
        mode="simplified"
      />
    );

    expect(screen.getByText('✓ 正确')).toBeInTheDocument();
  });

  it('shows correct feedback when answer is incorrect', () => {
    render(
      <CharacterInput
        value="个"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        mode="simplified"
      />
    );

    expect(screen.getByText('✗ 错误，正确答案是: 们')).toBeInTheDocument();
  });

  it('applies correct styling when answer is correct', () => {
    render(
      <CharacterInput
        value="们"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={true}
        mode="simplified"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border-color: rgb(16, 185, 129)');
  });

  it('applies correct styling when answer is incorrect', () => {
    render(
      <CharacterInput
        value="个"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        mode="simplified"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('border-color: rgb(239, 68, 68)');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode="simplified"
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
}); 
