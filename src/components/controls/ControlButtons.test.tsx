import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ControlButtons } from './ControlButtons';

describe('ControlButtons', () => {
  it('calls correct handlers when buttons are clicked', async () => {
    const user = userEvent.setup();
    const mockOnTogglePinyin = vi.fn();
    const mockOnToggleEnglish = vi.fn();
    const mockOnNext = vi.fn();
    render(
      <ControlButtons
        onTogglePinyin={mockOnTogglePinyin}
        onToggleEnglish={mockOnToggleEnglish}
        onNext={mockOnNext}
      />
    );
    await user.click(screen.getByText(/pinyin/i));
    expect(mockOnTogglePinyin).toHaveBeenCalled();
    await user.click(screen.getByText(/english/i));
    expect(mockOnToggleEnglish).toHaveBeenCalled();
    await user.click(screen.getByText(/next/i));
    expect(mockOnNext).toHaveBeenCalled();
  });
});
