import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        currentIndex={0}
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
        currentIndex={0}
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
        currentIndex={0}
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
        currentIndex={0}
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
        currentIndex={0}
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
        currentIndex={0}
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
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('clears input when currentIndex changes', () => {
    const { rerender } = render(
      <PinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');

    // Change the currentIndex prop
    rerender(
      <PinyinInput
        currentPinyin="wo3"
        currentIndex={1}
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('flashes green when flashResult is correct', async () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult="correct"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('flash-correct');

    // Wait for animation to complete
    await waitFor(() => {
      expect(input).not.toHaveClass('flash-correct');
    }, { timeout: 1100 });
  });

  it('flashes red when flashResult is incorrect', async () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult="incorrect"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('flash-incorrect');

    // Wait for animation to complete
    await waitFor(() => {
      expect(input).not.toHaveClass('flash-incorrect');
    }, { timeout: 1100 });
  });

  it('does not flash when flashResult is null', () => {
    render(
      <PinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={null}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveClass('flash-correct');
    expect(input).not.toHaveClass('flash-incorrect');
  });
}); 
