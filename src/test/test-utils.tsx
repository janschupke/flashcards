import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe, { type Result } from 'axe-core';
import { ToastProvider } from '../contexts/ToastContext';
import { FlashCardProvider } from '../contexts/FlashCardContext';
import { ROUTES } from '../constants/routes';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial router entry. Defaults to the flashcard page. */
  route?: string;
}

/**
 * Renders inside the same provider stack the app uses.
 *
 * Every test used to inline its own MemoryRouter and provider wrapper -- about
 * twenty call sites, and two copies of a private renderWithToast.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = ROUTES.FLASHCARDS, ...options }: ProviderOptions = {}
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <FlashCardProvider>{children}</FlashCardProvider>
        </ToastProvider>
      </MemoryRouter>
    ),
    ...options,
  });

/**
 * Renders with only the router, for components that do not need app state.
 */
export const renderWithRouter = (
  ui: ReactElement,
  { route = ROUTES.FLASHCARDS, ...options }: ProviderOptions = {}
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
    ...options,
  });

const formatViolations = (violations: Result[]): string =>
  violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `      ${String(node.target)}`)
        .slice(0, 5)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n${targets}`;
    })
    .join('\n');

/**
 * Fails the test if axe finds any accessibility violation in `container`.
 *
 * jsdom has no layout, so axe cannot evaluate colour-contrast here -- that rule
 * is disabled explicitly rather than silently returning "passed". Contrast is
 * handled by choosing token values that meet AA at the sizes they are used.
 */
export const expectNoA11yViolations = async (container: HTMLElement): Promise<void> => {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });

  if (results.violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations, found ${results.violations.length}:\n${formatViolations(
        results.violations
      )}`
    );
  }
};
