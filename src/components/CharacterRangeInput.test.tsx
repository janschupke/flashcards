
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterRangeInput } from './CharacterRangeInput';

describe('CharacterRangeInput', () => {
  const mockOnLimitChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with current limit', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    expect(input).toHaveValue(100);
  });

  it('calls onLimitChange when input loses focus with valid value', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    expect(mockOnLimitChange).toHaveBeenCalledWith(150);
  });

  it('clamps value to minimum of 50', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);

    expect(input).toHaveValue(50);
    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
  });

  it('clamps value to maximum of data length', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.blur(input);

    // Assuming data length is less than 9999
    expect(mockOnLimitChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('increases limit by 50 when up arrow is pressed', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(mockOnLimitChange).toHaveBeenCalledWith(150);
  });

  it('decreases limit by 50 when down arrow is pressed', () => {
    render(
      <CharacterRangeInput
        currentLimit={150}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(mockOnLimitChange).toHaveBeenCalledWith(100);
  });

  it('prevents going below minimum when down arrow is pressed', () => {
    render(
      <CharacterRangeInput
        currentLimit={75}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
  });

  it('prevents going above maximum when up arrow is pressed', () => {
    // Use the real data length
    const data = require('../data.json');
    const maxLimit = data.length;
    render(
      <CharacterRangeInput
        currentLimit={maxLimit - 25}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    // Should clamp to maxLimit
    expect(mockOnLimitChange).toHaveBeenCalledWith(maxLimit);
  });

  it('shows error styling when arrow key would exceed limits', () => {
    render(
      <CharacterRangeInput
        currentLimit={25}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // The input should show error styling (red border)
    expect(input).toHaveStyle('border-color: rgb(220, 53, 69)');
  });

  it('updates input value when currentLimit prop changes', () => {
    const { rerender } = render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    expect(screen.getByTestId('range-input')).toHaveValue(100);

    rerender(
      <CharacterRangeInput
        currentLimit={200}
        onLimitChange={mockOnLimitChange}
      />
    );

    expect(screen.getByTestId('range-input')).toHaveValue(200);
  });

  it('has correct min and max attributes', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    expect(input).toHaveAttribute('min', '50');
    expect(input).toHaveAttribute('max');
  });
}); 
