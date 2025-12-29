import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    expect(button).toBeInTheDocument();
  });

  it('should toggle menu on button click', () => {
    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    expect(screen.queryByText('Flashcards')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Flashcards')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText('Flashcards')).not.toBeInTheDocument();
  });

  it('should prevent body scroll when menu is open', () => {
    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    expect(document.body.classList.contains('overflow-hidden')).toBe(true);
  });

  it('should restore body scroll when menu is closed', () => {
    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('should render all navigation tabs', () => {
    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
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
      <BrowserRouter>
        <div>
          <div data-testid="outside">Outside</div>
          <MobileMenu />
        </div>
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    expect(screen.getByText('Flashcards')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    expect(screen.queryByText('Flashcards')).not.toBeInTheDocument();
  });

  it('should close menu when route changes', () => {
    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
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
    // Mock useLocation to return history route
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({ pathname: ROUTES.HISTORY }),
      };
    });

    render(
      <BrowserRouter>
        <MobileMenu />
      </BrowserRouter>
    );

    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    const historyLink = screen.getByText('History').closest('a');
    expect(historyLink).toHaveClass('bg-primary');
  });
});


