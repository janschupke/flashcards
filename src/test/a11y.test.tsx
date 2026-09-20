import { describe, it, beforeEach } from 'vitest';
import { AppLayout } from '../components/layout/AppLayout';
import { PageShell } from '../components/layout/PageShell';
import { FlashcardPage } from '../components/core/FlashcardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { StatisticsPage } from '../pages/StatisticsPage';
import { AboutPage } from '../pages/AboutPage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PaginatedTable } from '../components/common/PaginatedTable';
import { ROUTES } from '../constants/routes';
import { renderWithProviders, renderWithRouter, expectNoA11yViolations } from './test-utils';

/**
 * Accessibility smoke tests.
 *
 * jsdom has no layout, so axe cannot evaluate colour-contrast here; that rule
 * is disabled explicitly in expectNoA11yViolations rather than silently
 * reporting a pass. Contrast is handled by the token values themselves.
 */
describe('accessibility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const routes = [
    ['flashcards', ROUTES.FLASHCARDS, <FlashcardPage key="f" />],
    ['history', ROUTES.HISTORY, <HistoryPage key="h" />],
    ['statistics', ROUTES.STATISTICS, <StatisticsPage key="s" />],
    ['about', ROUTES.ABOUT, <AboutPage key="a" />],
  ] as const;

  it.each(routes)('has no violations on the %s page', async (_name, route, element) => {
    const { container } = renderWithProviders(<AppLayout>{element}</AppLayout>, { route });

    await expectNoA11yViolations(container);
  });

  // These two need no app state, only a router.
  it('has no violations in the reset confirmation dialog', async () => {
    const { container } = renderWithRouter(
      <ConfirmModal
        isOpen
        title="Reset Statistics?"
        message="This will permanently delete all your progress."
        confirmText="Confirm Reset"
        cancelText="Cancel"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    await expectNoA11yViolations(container);
  });

  it('has no violations in a paginated table', async () => {
    const data = Array.from({ length: 5 }, (_, i) => ({ simplified: `字${i}`, count: i }));
    const { container } = renderWithRouter(
      <PageShell title="Table">
        <PaginatedTable
          data={data}
          caption="Test table"
          columns={[
            { header: 'Character', accessorKey: 'simplified' },
            { header: 'Count', accessorKey: 'count' },
          ]}
        />
      </PageShell>
    );

    await expectNoA11yViolations(container);
  });
});
