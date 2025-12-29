import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Navigation } from './Navigation';
import { AppTab } from '../../types/layout';
import { ROUTES } from '../../constants/routes';

// Mock dependencies
vi.mock('./TabNavigation', () => ({
  TabNavigation: ({ activeTab }: { activeTab: AppTab }) => (
    <div data-testid="tab-navigation">TabNavigation - {activeTab}</div>
  ),
}));
vi.mock('./MobileMenu', () => ({
  MobileMenu: () => <div data-testid="mobile-menu">MobileMenu</div>,
}));
vi.mock('./FlashcardStatsPanel', () => ({
  FlashcardStatsPanel: () => <div data-testid="flashcard-stats-panel">FlashcardStatsPanel</div>,
}));

describe('Navigation', () => {
  const defaultProps = {
    activeTab: AppTab.FLASHCARDS,
    adaptiveRange: 100,
    correctAnswers: 50,
    totalSeen: 100,
    allAnswers: [],
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render logo link', () => {
    render(
      <BrowserRouter>
        <Navigation {...defaultProps} />
      </BrowserRouter>
    );

    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', ROUTES.FLASHCARDS);
  });

  it('should render TabNavigation on desktop', () => {
    render(
      <BrowserRouter>
        <Navigation {...defaultProps} />
      </BrowserRouter>
    );

    const tabNav = screen.getByTestId('tab-navigation');
    expect(tabNav).toBeInTheDocument();
    expect(tabNav).toHaveTextContent('TabNavigation - FLASHCARDS');
  });

  it('should render MobileMenu on mobile', () => {
    render(
      <BrowserRouter>
        <Navigation {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });

  it('should show FlashcardStatsPanel on flashcards page', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('flashcard-stats-panel')).toBeInTheDocument();
  });

  it('should not show FlashcardStatsPanel on other pages', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.HISTORY]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('flashcard-stats-panel')).not.toBeInTheDocument();
  });

  it('should pass correct props to TabNavigation', () => {
    render(
      <BrowserRouter>
        <Navigation {...defaultProps} activeTab={AppTab.HISTORY} />
      </BrowserRouter>
    );

    const tabNav = screen.getByTestId('tab-navigation');
    expect(tabNav).toHaveTextContent('TabNavigation - HISTORY');
  });
});
