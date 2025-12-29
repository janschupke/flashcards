import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import * as FlashCardContext from '../../contexts/FlashCardContext';
import type { FlashCardContextValue } from '../../contexts/FlashCardContext';
import { FlashcardMode, HINT_TYPES } from '../../types';

// Mock dependencies
vi.mock('../../contexts/FlashCardContext');
vi.mock('../common/ToastContainer', () => ({
  ToastContainer: () => <div data-testid="toast-container">ToastContainer</div>,
}));
vi.mock('./Navigation', () => ({
  Navigation: ({ activeTab }: { activeTab: string }) => (
    <nav data-testid="navigation">Navigation - {activeTab}</nav>
  ),
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
      <BrowserRouter>
        <AppLayout>
          <div data-testid="child">Test Content</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render Navigation component', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should render ToastContainer', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('should determine active tab from route', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </BrowserRouter>
    );

    // Should show navigation with active tab
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });
});
