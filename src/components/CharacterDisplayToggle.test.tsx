import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterDisplayToggle } from './CharacterDisplayToggle';

describe('CharacterDisplayToggle', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('should render all three toggle buttons', () => {
    render(
      <CharacterDisplayToggle
        displayMode="simplified"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('Simplified')).toBeInTheDocument();
    expect(screen.getByText('Traditional')).toBeInTheDocument();
    expect(screen.getByText('Both')).toBeInTheDocument();
  });

  it('should highlight the active button', () => {
    render(
      <CharacterDisplayToggle
        displayMode="traditional"
        onModeChange={mockOnModeChange}
      />
    );

    const traditionalButton = screen.getByText('Traditional');
    expect(traditionalButton).toHaveStyle({ backgroundColor: '#007bff' });
  });

  it('should call onModeChange when buttons are clicked', () => {
    render(
      <CharacterDisplayToggle
        displayMode="simplified"
        onModeChange={mockOnModeChange}
      />
    );

    fireEvent.click(screen.getByText('Traditional'));
    expect(mockOnModeChange).toHaveBeenCalledWith('traditional');

    fireEvent.click(screen.getByText('Both'));
    expect(mockOnModeChange).toHaveBeenCalledWith('both');
  });

  it('should have proper ARIA labels', () => {
    render(
      <CharacterDisplayToggle
        displayMode="simplified"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByLabelText('Show simplified characters')).toBeInTheDocument();
    expect(screen.getByLabelText('Show traditional characters')).toBeInTheDocument();
    expect(screen.getByLabelText('Show both simplified and traditional characters')).toBeInTheDocument();
  });
}); 
