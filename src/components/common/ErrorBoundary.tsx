import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { ButtonVariant } from '../../types/components';
import { clearAllStorage } from '../../utils/storageUtils';
import { logger } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last line of defence around the app.
 *
 * All progress lives in localStorage, so a corrupt record used to be able to
 * throw from deep inside a state update and leave a blank page with no way
 * out. This at least explains what happened and offers the one recovery that
 * always works.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled error:', error);
    logger.error('Component stack:', info.componentStack);
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  private readonly handleResetData = (): void => {
    clearAllStorage();
    window.location.reload();
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-surface-primary p-6"
      >
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-3">Something went wrong</h1>
          <p className="text-text-secondary mb-6">
            The app hit an unexpected error. Reloading usually fixes it. If it keeps happening, your
            saved progress may be corrupted and clearing it will get you going again.
          </p>
          <div className="flex gap-3 justify-center">
            <Button type="button" onClick={this.handleReload} variant={ButtonVariant.PRIMARY}>
              Reload
            </Button>
            <Button type="button" onClick={this.handleResetData} variant={ButtonVariant.ERROR}>
              Clear saved data
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
