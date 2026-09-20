import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToastContext } from './ToastContext';
import { ToastContainer } from '../components/common/ToastContainer';
import { ANIMATION_TIMINGS } from '../constants';

const Harness = (): ReactElement => {
  const { showToast } = useToastContext();
  return (
    <>
      <button type="button" onClick={() => showToast('Saved', 'success')}>
        success
      </button>
      <button type="button" onClick={() => showToast('Broke', 'error')}>
        error
      </button>
      <ToastContainer />
    </>
  );
};

const renderHarness = (): ReturnType<typeof render> =>
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>
  );

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // fireEvent rather than userEvent: userEvent's internal delays deadlock
  // against fake timers, and these tests are specifically about timers.
  const click = (name: string): void => {
    fireEvent.click(screen.getByRole('button', { name }));
  };

  it('shows a toast in a labelled live region', () => {
    renderHarness();

    click('success');

    expect(screen.getByRole('alert')).toHaveTextContent('Saved');
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('stacks multiple toasts', () => {
    renderHarness();
    click('success');
    click('error');

    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('auto-dismisses after the configured duration', () => {
    renderHarness();

    click('success');
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(ANIMATION_TIMINGS.TOAST_DURATION);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses on the close button before the timer fires', () => {
    renderHarness();
    click('success');
    click('Dismiss notification');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears pending timers on unmount so nothing fires afterwards', () => {
    const { unmount } = renderHarness();
    click('success');

    unmount();

    // Would throw an update-after-unmount warning if the timer survived.
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(ANIMATION_TIMINGS.TOAST_DURATION * 2);
      });
    }).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('throws when used outside its provider', () => {
    const Orphan = (): ReactElement => {
      useToastContext();
      return <div />;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Orphan />)).toThrow();

    spy.mockRestore();
  });
});
