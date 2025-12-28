import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RangeInput } from './RangeInput';

describe('RangeInput', () => {
  const mockOnLimitChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with current limit', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(100);
  });

  it('displays default label', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    expect(screen.getByText('Range:')).toBeInTheDocument();
  });

  it('displays custom label', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
        label="Custom Label:"
      />
    );

    expect(screen.getByText('Custom Label:')).toBeInTheDocument();
  });

  it('calls onLimitChange when value changes within range', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '150' } });

    expect(mockOnLimitChange).toHaveBeenCalledWith(150);
  });

  it('clamps value to minLimit on change', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '30' } });

    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
  });

  it('clamps value to maxLimit on change', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '250' } });

    expect(mockOnLimitChange).toHaveBeenCalledWith(200);
  });

  it('clamps value to minLimit on blur', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.blur(input);

    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
  });

  it('updates input value when currentLimit prop changes', () => {
    const { rerender } = render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(100);

    rerender(
      <RangeInput
        currentLimit={150}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    expect(input).toHaveValue(150);
  });

  it('uses custom test id', () => {
    render(
      <RangeInput
        currentLimit={100}
        minLimit={50}
        maxLimit={200}
        onLimitChange={mockOnLimitChange}
        data-testid="custom-range-input"
      />
    );

    expect(screen.getByTestId('custom-range-input')).toBeInTheDocument();
  });
});

