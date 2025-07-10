import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PinyinInput } from './PinyinInput';
import React from 'react';
import { FlashResult } from '../types';

describe('PinyinInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function ControlledPinyinInput(props: any) {
    const [value, setValue] = React.useState(props.value || '');
    return (
      <PinyinInput
        {...props}
        value={value}
        onChange={setValue}
      />
    );
  }

  it('renders input field', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSubmit when Enter is pressed', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ni' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('ni');
  });

  it('shows correct feedback when pinyin is correct', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={true}
      />
    );

    expect(screen.getByText('✓ 正确')).toBeInTheDocument();
  });

  it('shows incorrect feedback when pinyin is wrong', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={false}
      />
    );

    expect(screen.getByText('✗ 错误，正确答案是: ni3')).toBeInTheDocument();
  });

  it('shows no feedback when isCorrect is null', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    // The feedback div should exist but be empty
    const feedbackElement = screen.getByTestId('feedback-text');
    expect(feedbackElement).toBeInTheDocument();
    expect(feedbackElement).toHaveTextContent('');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        disabled={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('updates value when onChange is called', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
  });

  it('calls onSubmit when Enter is pressed with input value', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSubmit).toHaveBeenCalledWith('test');
  });

  it('shows green border when flashResult is correct', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#10b981' });
  });

  it('shows red border when flashResult is incorrect', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={FlashResult.INCORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#ef4444' });
  });

  it('shows default border when flashResult is null', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={null}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#4a5568' });
  });

  // Additional border highlighting tests
  it('prioritizes flashResult over isCorrect for border color', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    // Should show green (flashResult) instead of red (isCorrect)
    expect(wrapper).toHaveStyle({ borderColor: '#10b981' });
  });

  it('shows green border when isCorrect is true and no flashResult', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={true}
        flashResult={null}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#10b981' });
  });

  it('shows red border when isCorrect is false and no flashResult', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={false}
        flashResult={null}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#ef4444' });
  });

  it('shows neutral border when isCorrect is null and no flashResult', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={null}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#4a5568' });
  });

  it('transitions from flash to neutral border after flash timeout', async () => {
    vi.useFakeTimers();
    
    const { rerender } = render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={FlashResult.CORRECT}
      />
    );

    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveStyle({ borderColor: '#10b981' });

    // Clear flashResult and advance timers
    rerender(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult={null}
      />
    );

    // Advance timers to trigger the flash timeout
    await vi.runAllTimersAsync();
    
    // Should now show neutral border
    expect(wrapper).toHaveStyle({ borderColor: '#4a5568' });
    
    vi.useRealTimers();
  });
}); 
