import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useInputVariant } from './useInputVariant';
import { FlashResult } from '../types';
import { InputVariant } from '../types/components';

describe('useInputVariant', () => {
  it('returns DEFAULT variant when isCorrect is null and not flashing', () => {
    const { result } = renderHook(() => useInputVariant(false, null, null));
    expect(result.current.variant).toBe(InputVariant.DEFAULT);
    expect(result.current.borderClass).toBe('border-border-secondary');
    expect(result.current.feedbackClass).toBe('text-text-tertiary');
  });

  it('returns SUCCESS variant when isCorrect is true', () => {
    const { result } = renderHook(() => useInputVariant(false, null, true));
    expect(result.current.variant).toBe(InputVariant.SUCCESS);
    expect(result.current.borderClass).toBe('border-success');
    expect(result.current.feedbackClass).toBe('text-success');
  });

  it('returns ERROR variant when isCorrect is false', () => {
    const { result } = renderHook(() => useInputVariant(false, null, false));
    expect(result.current.variant).toBe(InputVariant.ERROR);
    expect(result.current.borderClass).toBe('border-error');
    expect(result.current.feedbackClass).toBe('text-error');
  });

  it('returns SUCCESS variant when flashing with CORRECT flashResult', () => {
    const { result } = renderHook(() => useInputVariant(true, FlashResult.CORRECT, null));
    expect(result.current.variant).toBe(InputVariant.SUCCESS);
    expect(result.current.borderClass).toBe('border-success');
    expect(result.current.feedbackClass).toBe('text-success');
  });

  it('returns ERROR variant when flashing with INCORRECT flashResult', () => {
    const { result } = renderHook(() => useInputVariant(true, FlashResult.INCORRECT, null));
    expect(result.current.variant).toBe(InputVariant.ERROR);
    expect(result.current.borderClass).toBe('border-error');
    expect(result.current.feedbackClass).toBe('text-error');
  });

  it('prioritizes flashing state over isCorrect state', () => {
    const { result } = renderHook(() => useInputVariant(true, FlashResult.INCORRECT, true));
    expect(result.current.variant).toBe(InputVariant.ERROR);
  });
});

