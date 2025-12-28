import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRangeInput } from './useRangeInput';
import React from 'react';

describe('useRangeInput', () => {
  it('initializes with currentLimit as string', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    expect(result.current.inputValue).toBe('100');
  });

  it('updates inputValue when currentLimit changes', () => {
    const mockOnLimitChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ currentLimit }) => useRangeInput(currentLimit, 50, 200, mockOnLimitChange),
      {
        initialProps: { currentLimit: 100 },
      }
    );

    expect(result.current.inputValue).toBe('100');

    rerender({ currentLimit: 150 });

    expect(result.current.inputValue).toBe('150');
  });

  it('clamps value to minLimit on change', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleChange({
        target: { value: '30' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
    expect(result.current.inputValue).toBe('50');
  });

  it('clamps value to maxLimit on change', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleChange({
        target: { value: '250' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(200);
    expect(result.current.inputValue).toBe('200');
  });

  it('allows valid values within range', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleChange({
        target: { value: '150' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(150);
    expect(result.current.inputValue).toBe('150');
  });

  it('allows non-numeric input without calling onLimitChange', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleChange({
        target: { value: 'abc' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).not.toHaveBeenCalled();
    expect(result.current.inputValue).toBe('abc');
  });

  it('clamps to minLimit on blur when value is invalid', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleBlur({
        target: { value: '30' },
      } as React.FocusEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(50);
    expect(result.current.inputValue).toBe('50');
  });

  it('clamps to maxLimit on blur when value exceeds max', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleBlur({
        target: { value: '250' },
      } as React.FocusEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(200);
    expect(result.current.inputValue).toBe('200');
  });

  it('accepts valid value on blur', () => {
    const mockOnLimitChange = vi.fn();
    const { result } = renderHook(() => useRangeInput(100, 50, 200, mockOnLimitChange));

    act(() => {
      result.current.handleBlur({
        target: { value: '150' },
      } as React.FocusEvent<HTMLInputElement>);
    });

    expect(mockOnLimitChange).toHaveBeenCalledWith(150);
    expect(result.current.inputValue).toBe('150');
  });
});

