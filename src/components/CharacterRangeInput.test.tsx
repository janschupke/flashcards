
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterRangeInput } from './CharacterRangeInput';
import data from '../data.json';

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
    const maxLimit = Math.min(1500, data.length);
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.blur(input);

    // Should clamp to the maximum allowed value
    expect(mockOnLimitChange).toHaveBeenCalledWith(maxLimit);
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
        currentLimit={50}
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

  it('enforces minimum limit of 50 when typing', () => {
    render(
      <CharacterRangeInput
        currentLimit={100}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.change(input, { target: { value: '30' } });
    expect(input).toHaveValue(50);
  });

  it('enforces minimum limit of 50 when using arrow keys', () => {
    render(
      <CharacterRangeInput
        currentLimit={60}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Should clamp to 50, not go below
    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
  });

  it('shows red border when arrow key would go below minimum', () => {
    render(
      <CharacterRangeInput
        currentLimit={50}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Should show red border for 1 second
    expect(input).toHaveStyle('border-color: rgb(220, 53, 69)');
  });

  it('shows red border when arrow key would go above maximum', () => {
    const maxLimit = data.length;
    render(
      <CharacterRangeInput
        currentLimit={maxLimit - 10}
        onLimitChange={mockOnLimitChange}
      />
    );

    const input = screen.getByTestId('range-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    // Should show red border for 1 second
    expect(input).toHaveStyle('border-color: rgb(220, 53, 69)');
  });
}); 
