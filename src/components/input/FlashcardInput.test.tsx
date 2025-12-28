import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FlashcardInput } from './FlashcardInput';

describe('FlashcardInput', () => {
  const mockOnSubmit = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field', () => {
    render(
      <FlashcardInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText=""
        isCorrect={null}
        flashResult={null}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(
      <FlashcardInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText=""
        isCorrect={null}
        flashResult={null}
      />
    );

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('displays feedback text', () => {
    render(
      <FlashcardInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText="Feedback message"
        isCorrect={null}
        flashResult={null}
      />
    );

    expect(screen.getByText('Feedback message')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    render(
      <FlashcardInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText=""
        isCorrect={null}
        flashResult={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('calls onSubmit when Enter is pressed', () => {
    render(
      <FlashcardInput
        value="test"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText=""
        isCorrect={null}
        flashResult={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('test');
  });

  it('does not call onSubmit when disabled', () => {
    render(
      <FlashcardInput
        value="test"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText=""
        isCorrect={null}
        flashResult={null}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('applies success styling when isCorrect is true', () => {
    const { container } = render(
      <FlashcardInput
        value="test"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText="Correct"
        isCorrect={true}
        flashResult={null}
      />
    );

    const input = container.querySelector('input');
    expect(input?.closest('div')).toHaveClass('border-success');
    expect(screen.getByText('Correct')).toHaveClass('text-success');
  });

  it('applies error styling when isCorrect is false', () => {
    const { container } = render(
      <FlashcardInput
        value="test"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder="Enter text"
        feedbackText="Incorrect"
        isCorrect={false}
        flashResult={null}
      />
    );

    const input = container.querySelector('input');
    expect(input?.closest('div')).toHaveClass('border-error');
    expect(screen.getByText('Incorrect')).toHaveClass('text-error');
  });
});
