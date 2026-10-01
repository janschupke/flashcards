import { test, expect } from '@playwright/test';
import { SCENARIOS, openScenario } from './scenarios';
import { auditFocusOrder, auditHover, tagHoverableControls } from './states';

/**
 * Every control, in every scenario, hovered and focused for real.
 *
 * Desktop only (the mobile project ignores this file in playwright.config.ts):
 * a phone has no hover, and its focus order is the same markup.
 */

for (const scenario of SCENARIOS.filter((s) => s.project !== 'mobile')) {
  test(`hover is visible and readable: ${scenario.name}`, async ({ page }) => {
    await openScenario(page, scenario);
    const controls = await tagHoverableControls(page);
    expect(controls.length, 'found no controls to hover').toBeGreaterThan(0);

    const problems: string[] = [];
    for (const selector of controls) {
      problems.push(...(await auditHover(page, selector)));
    }

    expect(problems, problems.join('\n')).toEqual([]);
  });

  test(`every tab stop shows focus: ${scenario.name}`, async ({ page }) => {
    await openScenario(page, scenario);
    const { stops, problems } = await auditFocusOrder(page);

    expect(stops, 'Tab reached no elements').toBeGreaterThan(0);
    expect(problems, problems.join('\n')).toEqual([]);
  });
}

/**
 * Negative control: the probes must reject the two failures this suite exists
 * for, or a green run means nothing. Both are the app's old hover styles.
 */
test('the probes reject an invisible hover and an unreadable one', async ({ page }) => {
  await page.setContent(`
    <style>
      body { margin: 0; padding: 40px; background: #ffffff; font: 16px sans-serif; }
      /* A real transition, like the app's: a probe that reads mid-transition
         sees the rest colour and would pass #good wrongly as invisible. */
      button { padding: 8px 12px; border: 0; margin-right: 8px; transition: background-color 150ms; }
      #faint { background: #f9fafb; color: #374151; }
      #faint:hover { background: #f3f4f6; }
      #light { background: #dc2626; color: #ffffff; }
      #light:hover { background: #ef4444; }
      #good { background: #f9fafb; color: #374151; }
      #good:hover { background: #e5e7eb; }
    </style>
    <main>
      <button id="faint">Faint</button><button id="light">Light</button><button id="good">Good</button>
    </main>
  `);

  // One at a time: the probes share the page's single mouse.
  expect((await auditHover(page, '#faint')).join('\n')).toMatch(/hover is not visible/);
  expect((await auditHover(page, '#light')).join('\n')).toMatch(/fails contrast while hovered/);
  expect(await auditHover(page, '#good')).toEqual([]);
});
