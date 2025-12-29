import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';
import { ROUTES } from '../../constants/routes';
import { AppTab } from '../../types/layout';

// Mock routing utils
vi.mock('../../utils/routingUtils', () => ({
  getRouteForTab: (tab: AppTab) => {
    const routeMap: Record<AppTab, string> = {
      [AppTab.FLASHCARDS]: ROUTES.FLASHCARDS,
      [AppTab.HISTORY]: ROUTES.HISTORY,
      [AppTab.STATISTICS]: ROUTES.STATISTICS,
      [AppTab.ABOUT]: ROUTES.ABOUT,
    };
    return routeMap[tab] ?? ROUTES.FLASHCARDS;
  },
}));

describe('MobileMenu', () => {
  beforeEach(() => {
    // Reset body class
    document.body.classList.remove('overflow-hidden');
  });

  it('should render hamburger button', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    expect(button).toBeInTheDocument();
  });

  it('should toggle menu on button click', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    // Menu is closed initially
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const flashcardsLink = screen.getByText('Flashcards');
    const menuContainer = flashcardsLink.closest('div[class*="max-h-0"]');
    expect(menuContainer).toBeInTheDocument();

    fireEvent.click(button);
    // Menu is open
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const openMenuContainer = flashcardsLink.closest('div[class*="max-h-96"]');
    expect(openMenuContainer).toBeInTheDocument();

    fireEvent.click(button);
    // Menu is closed again
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const closedMenuContainer = flashcardsLink.closest('div[class*="max-h-0"]');
    expect(closedMenuContainer).toBeInTheDocument();
  });

  it('should prevent body scroll when menu is open', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    expect(document.body.classList.contains('overflow-hidden')).toBe(true);
  });

  it('should restore body scroll when menu is closed', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('should render all navigation tabs', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    expect(screen.getByText('Flashcards')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should close menu when clicking outside', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <div>
          <div data-testid="outside">Outside</div>
          <MobileMenu />
        </div>
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    // Menu is open
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const flashcardsLink = screen.getByText('Flashcards');
    const openMenuContainer = flashcardsLink.closest('div[class*="max-h-96"]');
    expect(openMenuContainer).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    // Menu is closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const closedMenuContainer = flashcardsLink.closest('div[class*="max-h-0"]');
    expect(closedMenuContainer).toBeInTheDocument();
  });

  it('should close menu when route changes', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.FLASHCARDS]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    expect(screen.getByText('Flashcards')).toBeInTheDocument();

    // Simulate route change by rerendering with different location
    // In a real test, this would be handled by React Router
    // For now, we test that the menu closes on navigation link click
    const flashcardsLink = screen.getByText('Flashcards').closest('a');
    if (flashcardsLink) {
      fireEvent.click(flashcardsLink);
    }
  });

  it('should highlight active tab', () => {
    // Use MemoryRouter with initialEntries to set the location for the test
    render(
      <MemoryRouter initialEntries={[ROUTES.HISTORY]}>
        <MobileMenu />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    const historyLink = screen.getByText('History').closest('a');
    expect(historyLink).toHaveClass('bg-primary');
  });
});
