import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ROUTES } from '../../constants/routes';

// Mock dependencies
vi.mock('./TabNavigation', () => ({
  TabNavigation: () => <div data-testid="tab-navigation">TabNavigation</div>,
}));
vi.mock('./MobileMenu', () => ({
  MobileMenu: () => <div data-testid="mobile-menu">MobileMenu</div>,
}));
vi.mock('./FlashcardStatsPanel', () => ({
  FlashcardStatsPanel: () => <div data-testid="flashcard-stats-panel">FlashcardStatsPanel</div>,
}));

describe('Navigation', () => {
  const defaultProps = {
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
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', ROUTES.FLASHCARDS);
  });

  it('should render TabNavigation on desktop', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
    );

    const tabNav = screen.getByTestId('tab-navigation');
    expect(tabNav).toBeInTheDocument();
    expect(tabNav).toHaveTextContent('TabNavigation');
  });

  it('should render MobileMenu on mobile', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
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

  it('should render TabNavigation without activeTab prop', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <Navigation {...defaultProps} />
      </MemoryRouter>
    );

    const tabNav = screen.getByTestId('tab-navigation');
    expect(tabNav).toBeInTheDocument();
    expect(tabNav).toHaveTextContent('TabNavigation');
  });
});
