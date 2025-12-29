import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import React from 'react';
import { AppLayout } from './AppLayout';
import * as FlashCardContext from '../../contexts/FlashCardContext';
import type { FlashCardContextValue } from '../../contexts/FlashCardContext';
import { FlashcardMode, HINT_TYPES } from '../../types';
import { ROUTES } from '../../constants/routes';
import { getActiveTabFromPath } from '../../utils/routingUtils';

// Mock dependencies
vi.mock('../../contexts/FlashCardContext');
vi.mock('../common/ToastContainer', () => ({
  ToastContainer: () => <div data-testid="toast-container">ToastContainer</div>,
}));
vi.mock('./Navigation', () => ({
  Navigation: ({ children }: { children?: React.ReactNode }) => {
    // Use actual Navigation to test route-based active tab determination
    const location = useLocation();
    const activeTab = getActiveTabFromPath(location.pathname);
    return (
      <nav data-testid="navigation" data-active-tab={activeTab}>
        Navigation - Active: {activeTab}
        {children}
      </nav>
    );
  },
}));

describe('AppLayout', () => {
  const mockContextValue = {
    // Add other required context values
    current: 0,
    limit: 100,
    hint: HINT_TYPES.NONE,
    totalSeen: 100,
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: 50,
    totalAttempted: 100,
    flashResult: null,
    previousCharacter: null,
    previousAnswer: null,
    incorrectAnswers: [],
    allAnswers: [],
    mode: FlashcardMode.BOTH,
    adaptiveRange: 100,
    recentAnswers: [],
    getNext: vi.fn(),
    toggleHint: vi.fn(),
    reset: vi.fn(),
    resetStatistics: vi.fn(),
    setPinyinInput: vi.fn(),
    evaluatePinyin: vi.fn(),
    resetScore: vi.fn(),
    setMode: vi.fn(),
    setPinyinFlashResult: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(FlashCardContext.useFlashCardContext).mockReturnValue(
      mockContextValue as FlashCardContextValue
    );
  });

  it('should render children', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <AppLayout>
          <div data-testid="child">Test Content</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render Navigation component', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should render ToastContainer', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('should determine active tab from route', () => {
    const testCases = [
      { route: ROUTES.FLASHCARDS, expectedTab: 'FLASHCARDS' },
      { route: ROUTES.HISTORY, expectedTab: 'HISTORY' },
      { route: ROUTES.STATISTICS, expectedTab: 'STATISTICS' },
      { route: ROUTES.ABOUT, expectedTab: 'ABOUT' },
    ];

    testCases.forEach(({ route, expectedTab }) => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <AppLayout>
            <div>Test</div>
          </AppLayout>
        </MemoryRouter>
      );

      const navigation = screen.getByTestId('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation).toHaveAttribute('data-active-tab', expectedTab);
      expect(navigation).toHaveTextContent(`Active: ${expectedTab}`);

      unmount();
    });
  });
});
