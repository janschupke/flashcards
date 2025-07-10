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
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('has autofocus attribute', () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
      />
    );

    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
  });

  it('calls onSubmit when input changes', () => {
    render(
      <ControlledPinyinInput
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
      <ControlledPinyinInput
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
      <ControlledPinyinInput
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
      <ControlledPinyinInput
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
      <ControlledPinyinInput
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
    function TestWrapper() {
      const [value, setValue] = React.useState('');
      const [index, setIndex] = React.useState(0);
      React.useEffect(() => { setValue(''); }, [index]);
      return (
        <>
          <PinyinInput
            value={value}
            onChange={setValue}
            currentPinyin={index === 0 ? 'ni3' : 'wo3'}
            currentIndex={index}
            onSubmit={mockOnSubmit}
            isCorrect={null}
          />
          <button onClick={() => setIndex(i => i + 1)}>Next</button>
        </>
      );
    }
    render(<TestWrapper />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
    fireEvent.click(screen.getByText('Next'));
    expect(input).toHaveValue('');
  });

  it('flashes green when flashResult is correct', async () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult="correct"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('flash-correct');
    await waitFor(() => {
      expect(input).not.toHaveClass('flash-correct');
    }, { timeout: 1100 });
  });

  it('flashes red when flashResult is incorrect', async () => {
    render(
      <ControlledPinyinInput
        currentPinyin="ni3"
        currentIndex={0}
        onSubmit={mockOnSubmit}
        isCorrect={null}
        flashResult="incorrect"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('flash-incorrect');
    await waitFor(() => {
      expect(input).not.toHaveClass('flash-incorrect');
    }, { timeout: 1100 });
  });

  it('does not flash when flashResult is null', () => {
    render(
      <ControlledPinyinInput
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
