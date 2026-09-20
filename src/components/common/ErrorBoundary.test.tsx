import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import * as storageUtils from '../../utils/storageUtils';

const Boom = (): ReactElement => {
  throw new Error('kaboom');
};

describe('ErrorBoundary', () => {
  let consoleError: MockInstance<typeof console.error>;
  const reload = vi.fn();

  beforeEach(() => {
    // React logs the caught error; silence it so the run stays readable.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });
    reload.mockClear();
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('shows a recovery screen when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear saved data' })).toBeInTheDocument();
  });

  it('reloads without touching storage on Reload', () => {
    const clear = vi.spyOn(storageUtils, 'clearAllStorage').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(clear).not.toHaveBeenCalled();
    clear.mockRestore();
  });

  it('clears storage and reloads on Clear saved data', () => {
    const clear = vi.spyOn(storageUtils, 'clearAllStorage').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear saved data' }));

    expect(clear).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
    clear.mockRestore();
  });
});
