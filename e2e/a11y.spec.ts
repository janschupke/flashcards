import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { formatViolations } from '../src/test/axe-format';
import { SCENARIOS, openScenario } from './scenarios';

/**
 * Full axe scans in a real browser, with colour-contrast ON.
 *
 * The Vitest axe tests cover structure but cannot judge contrast (jsdom has no
 * layout). Every rule axe ships runs here, the same set the jsdom helper uses
 * minus nothing, at desktop and phone widths.
 */
for (const scenario of SCENARIOS) {
  test(`no axe violations: ${scenario.name}`, async ({ page }, testInfo) => {
    test.skip(
      scenario.project !== undefined && scenario.project !== testInfo.project.name,
      `${scenario.project} only`
    );

    await openScenario(page, scenario);
    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations, formatViolations(violations)).toEqual([]);
  });
}
