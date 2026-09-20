import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from './ConfirmModal';
import { renderWithRouter } from '../../test/test-utils';

describe('ConfirmModal', () => {
  const props = {
    title: 'Reset Statistics?',
    message: 'This will permanently delete all your progress.',
    confirmText: 'Confirm Reset',
    cancelText: 'Cancel',
  };

  let onConfirm: Mock<() => void>;
  let onCancel: Mock<() => void>;

  beforeEach(() => {
    onConfirm = vi.fn<() => void>();
    onCancel = vi.fn<() => void>();
  });

  const open = (): void => {
    renderWithRouter(<ConfirmModal isOpen {...props} onConfirm={onConfirm} onCancel={onCancel} />);
  };

  it('renders nothing when closed', () => {
    renderWithRouter(
      <ConfirmModal isOpen={false} {...props} onConfirm={onConfirm} onCancel={onCancel} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a labelled, described modal dialog', () => {
    open();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName(props.title);
    expect(dialog).toHaveAccessibleDescription(props.message);
  });

  it('moves focus to the confirm button on open', () => {
    open();

    expect(screen.getByRole('button', { name: props.confirmText })).toHaveFocus();
  });

  it('confirms on click', async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole('button', { name: props.confirmText }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels on click', async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole('button', { name: props.cancelText }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancels on Escape', async () => {
    const user = userEvent.setup();
    open();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirms only the button that has focus, never on a stray Enter', async () => {
    const user = userEvent.setup();
    open();

    // Focus starts on Confirm; move to Cancel and press Enter.
    await user.tab();
    await user.keyboard('{Enter}');

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup();
    open();
    const confirm = screen.getByRole('button', { name: props.confirmText });
    const cancel = screen.getByRole('button', { name: props.cancelText });

    // Only the two action buttons are reachable, and Tab wraps between them.
    const seen: Element[] = [];
    for (let i = 0; i < 4; i++) {
      seen.push(document.activeElement as Element);
      await user.tab();
    }

    expect(new Set(seen)).toEqual(new Set([confirm, cancel]));
  });

  it('locks body scroll while open and releases it on close', () => {
    const { unmount } = renderWithRouter(
      <ConfirmModal isOpen {...props} onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
