import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Statistics } from './Statistics';

// Mock storage utilities
vi.mock('../../utils/storageUtils', () => ({
  getAllCharacterPerformance: vi.fn(() => []),
}));

describe('Statistics', () => {
  it('displays empty state when no statistics', () => {
    render(<Statistics />);

    expect(screen.getByText(/No statistics yet/i)).toBeInTheDocument();
  });
});
