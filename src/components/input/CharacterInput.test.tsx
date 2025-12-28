import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterInput } from './CharacterInput';
import { FlashcardMode, FlashResult } from '../../types';

describe('CharacterInput', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows correct placeholder for simplified mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

    expect(screen.getByPlaceholderText('输入简体字')).toBeInTheDocument();
  });

  it('shows correct placeholder for traditional mode', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="們"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.TRADITIONAL}
      />
    );

    expect(screen.getByPlaceholderText('输入繁体字')).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '们' } });

    expect(mockOnChange).toHaveBeenCalledWith('们');
  });

  it('calls onSubmit when Enter is pressed', () => {
    const { rerender } = render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '们' } });

    // Update the component with the new value to simulate controlled component behavior
    rerender(
      <CharacterInput
        value="们"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

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
        mode={FlashcardMode.SIMPLIFIED}
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
        mode={FlashcardMode.SIMPLIFIED}
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
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-success');
  });

  it('applies correct styling when answer is incorrect', () => {
    render(
      <CharacterInput
        value="个"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        mode={FlashcardMode.SIMPLIFIED}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-error');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  // Border highlighting tests
  it('shows green border when flashResult is correct', () => {
    render(
      <CharacterInput
        value="们"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-success');
  });

  it('shows red border when flashResult is incorrect', () => {
    render(
      <CharacterInput
        value="个"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
        flashResult={FlashResult.INCORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-error');
  });

  it('shows default border when flashResult is null', () => {
    render(
      <CharacterInput
        value=""
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
        flashResult={null}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-border-secondary');
  });

  it('prioritizes flashResult over isCorrect for border color', () => {
    render(
      <CharacterInput
        value="个"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        mode={FlashcardMode.SIMPLIFIED}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    // Should show green (flashResult) instead of red (isCorrect)
    expect(wrapper).toHaveClass('border-success');
  });

  it('transitions from flash to neutral border after flash timeout', async () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <CharacterInput
        value="们"
        onChange={mockOnChange}
        expectedCharacter="们"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        mode={FlashcardMode.SIMPLIFIED}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('border-success');

    // Advance timers to complete the flash animation
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Clear flashResult after flash completes
    act(() => {
      rerender(
        <CharacterInput
          value="们"
          onChange={mockOnChange}
          expectedCharacter="们"
          onSubmit={mockOnSubmit}
          isCorrect={null}
          mode={FlashcardMode.SIMPLIFIED}
          flashResult={null}
        />
      );
    });

    // Should now show neutral border (isCorrect is null, flashResult is null)
    expect(wrapper).toHaveClass('border-border-secondary');

    vi.useRealTimers();
  });
});
