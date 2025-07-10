import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PinyinInput } from './PinyinInput';
import React from 'react';

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
    const { container } = render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    // Find the feedback div by looking for the styled component class
    const feedbackElement = container.querySelector('div[class*="sc-fhHczv"]');
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
        flashResult="correct"
      />
    );

    const input = screen.getByRole('textbox');
    // Check that the input has the correct border color by checking the styled-component class
    expect(input).toHaveStyle({ borderColor: '#10b981' });
  });

  it('shows red border when flashResult is incorrect', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult="incorrect"
      />
    );

    const input = screen.getByRole('textbox');
    // Check that the input has the correct border color by checking the styled-component class
    expect(input).toHaveStyle({ borderColor: '#ef4444' });
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

    const input = screen.getByRole('textbox');
    // Check that the input has the default border color
    expect(input).toHaveStyle({ borderColor: '#4a5568' });
  });
}); 
