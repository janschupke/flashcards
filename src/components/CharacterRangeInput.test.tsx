
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CharacterRangeInput } from './CharacterRangeInput';
import { validateLimit } from '../utils/characterUtils';

vi.mock('../utils/characterUtils');

describe('CharacterRangeInput', () => {
  it('renders with current limit', () => {
    const mockOnLimitChange = vi.fn();
    render(<CharacterRangeInput currentLimit={5} onLimitChange={mockOnLimitChange} />);
    expect(screen.getByTestId('range-input')).toHaveValue(5);
  });

  it('calls onLimitChange when input changes', async () => {
    const user = userEvent.setup();
    const mockOnLimitChange = vi.fn();
    vi.mocked(validateLimit).mockReturnValue(3);
    render(<CharacterRangeInput currentLimit={5} onLimitChange={mockOnLimitChange} />);
    const input = screen.getByTestId('range-input');
    await user.clear(input);
    await user.type(input, '3');
    await user.tab();
    expect(mockOnLimitChange).toHaveBeenCalledWith(3);
  });
}); 
