import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ControlButtons } from './ControlButtons';

describe('ControlButtons', () => {
  it('calls onNext handler when Next button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnNext = vi.fn();
    render(<ControlButtons onNext={mockOnNext} />);
    await user.click(screen.getByText(/next/i));
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('renders Next button', () => {
    const mockOnNext = vi.fn();
    render(<ControlButtons onNext={mockOnNext} />);
    expect(screen.getByText(/next/i)).toBeInTheDocument();
  });
});
