import type { Locator, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { formatViolations } from '../src/test/axe-format';
import {
  HOVER_BACKGROUND_MIN_DELTA_E,
  HOVER_TEXT_MIN_DELTA_E,
  type Rgba,
  composite,
  deltaE,
  parseColor,
} from '../src/test/color';

/**
 * Hover and focus probes.
 *
 * axe only sees the state a page is in when it runs, and jsdom has no :hover
 * at all, so an unreadable or invisible hover passes every static check. These
 * put the real pointer and keyboard on each control and measure what changes.
 * The page only reports raw computed colours; the maths runs here in Node.
 */

const CONTROL_SELECTOR = 'a[href], button, select, [role="button"]';
const PROBE_ATTRIBUTE = 'data-probe';

/** A border has to move further than a fill to read as a focus indicator. */
const FOCUS_BORDER_MIN_DELTA_E = 0.1;

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/**
 * Tags every control a pointer can reach -- enabled, in the tab order, big
 * enough to see, and not covered by something else such as a modal backdrop
 * -- and returns their selectors.
 */
export const tagHoverableControls = async (page: Page): Promise<string[]> => {
  const count = await page.evaluate(
    ({ selector, attribute }) => {
      const controls = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => {
        if (el.matches(':disabled') || el.tabIndex < 0) return false;
        el.scrollIntoView({ block: 'center' });
        const rect = el.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) return false;
        if (getComputedStyle(el).visibility !== 'visible') return false;
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        return hit !== null && (hit === el || el.contains(hit));
      });
      controls.forEach((el, i) => el.setAttribute(attribute, String(i)));
      return controls.length;
    },
    { selector: CONTROL_SELECTOR, attribute: PROBE_ATTRIBUTE }
  );
  return Array.from({ length: count }, (_, i) => `[${PROBE_ATTRIBUTE}="${i}"]`);
};

interface NodeColors {
  /** background-color of the node, then each ancestor up to <html>. */
  backgrounds: string[];
  color: string;
  decoration: string;
}

/**
 * Waits for every running CSS transition to finish.
 *
 * Controls carry transition-colors/transition-all, and getComputedStyle read
 * in the same task as the state change returns the transition's START value,
 * which is the old colour. Even at the 0.01ms reduced-motion duration a read
 * has to wait for the transitions to actually end. getAnimations() flushes
 * pending style first, so a transition the hover just triggered is included.
 */
const settleTransitions = (page: Page): Promise<void> =>
  page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        // A cancelled transition has also stopped moving.
        .map((animation) => animation.finished.catch(() => undefined))
    );
  });

/** Colours of a control and its descendants (a link's colour may live on a child). */
const readColors = (control: Locator): Promise<NodeColors[]> =>
  control.evaluate((el) =>
    [el, ...Array.from(el.querySelectorAll('*'))].slice(0, 25).map((node) => {
      const backgrounds: string[] = [];
      for (let n: Element | null = node; n; n = n.parentElement) {
        backgrounds.push(getComputedStyle(n).backgroundColor);
      }
      const style = getComputedStyle(node);
      return { backgrounds, color: style.color, decoration: style.textDecorationLine };
    })
  );

/** What the eye sees: every background in the stack, painted over the canvas. */
const flatten = (backgrounds: string[]): Rgba =>
  backgrounds.reduceRight((under, layer) => composite(parseColor(layer), under), WHITE);

const labelOf = async (control: Locator): Promise<string> =>
  control.evaluate((el) => {
    const label = el instanceof HTMLInputElement ? el.labels?.[0]?.textContent : undefined;
    const name =
      el.getAttribute('aria-label') ?? label ?? el.textContent?.trim().slice(0, 40) ?? '';
    return `<${el.tagName.toLowerCase()}> "${name}"`;
  });

/**
 * Hovers one control and returns every problem found: a hover nobody can see,
 * or colours that fail axe's contrast rule while hovered.
 */
export const auditHover = async (page: Page, selector: string): Promise<string[]> => {
  const control = page.locator(selector);
  const label = await labelOf(control);

  await page.mouse.move(0, 0);
  await settleTransitions(page);
  const rest = await readColors(control);
  await control.hover();
  await settleTransitions(page);
  const hovered = await readColors(control);

  let background = 0;
  let text = 0;
  let decorationChanged = false;
  rest.forEach((before, i) => {
    const after = hovered[i];
    if (!after) return;
    background = Math.max(
      background,
      deltaE(flatten(before.backgrounds), flatten(after.backgrounds))
    );
    text = Math.max(text, deltaE(parseColor(before.color), parseColor(after.color)));
    decorationChanged ||= before.decoration !== after.decoration;
  });

  const problems: string[] = [];
  if (
    background < HOVER_BACKGROUND_MIN_DELTA_E &&
    text < HOVER_TEXT_MIN_DELTA_E &&
    !decorationChanged
  ) {
    problems.push(
      `${label}: hover is not visible (background ΔE ${background.toFixed(3)} < ${HOVER_BACKGROUND_MIN_DELTA_E}, text ΔE ${text.toFixed(3)} < ${HOVER_TEXT_MIN_DELTA_E})`
    );
  }

  const { violations } = await new AxeBuilder({ page })
    .include(selector)
    .withRules(['color-contrast'])
    .analyze();
  if (violations.length > 0) {
    problems.push(`${label}: fails contrast while hovered\n${formatViolations(violations)}`);
  }

  await page.mouse.move(0, 0);
  return problems;
};

interface FocusStyle {
  outline: string;
  boxShadow: string;
  borders: string[];
}

/** Indicator-bearing styles of the element and its parent (a field's ring may sit on its wrapper). */
const readFocusStyle = (control: Locator): Promise<FocusStyle> =>
  control.evaluate((el) => {
    const own = getComputedStyle(el);
    const parent = el.parentElement ? getComputedStyle(el.parentElement) : own;
    const outline =
      own.outlineStyle === 'none' || own.outlineWidth === '0px'
        ? 'none'
        : `${own.outlineStyle} ${own.outlineWidth} ${own.outlineColor}`;
    return {
      outline,
      boxShadow: `${own.boxShadow} | ${parent.boxShadow}`,
      borders: [own.borderTopColor, parent.borderTopColor],
    };
  });

const showsFocus = (rest: FocusStyle, focused: FocusStyle): boolean =>
  focused.outline !== 'none' ||
  focused.boxShadow !== rest.boxShadow ||
  focused.borders.some(
    (border, i) =>
      deltaE(parseColor(border), parseColor(rest.borders[i] ?? border)) >= FOCUS_BORDER_MIN_DELTA_E
  );

/**
 * Walks the Tab order until it repeats and returns every stop that shows no
 * focus indicator. Each stop's focused style is compared against the same
 * element with focus elsewhere.
 */
export const auditFocusOrder = async (
  page: Page
): Promise<{ stops: number; problems: string[] }> => {
  const focused: FocusStyle[] = [];
  const labels: string[] = [];

  for (let press = 0; press < 150; press += 1) {
    await page.keyboard.press('Tab');
    await settleTransitions(page);
    const index = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return -1;
      const existing = el.getAttribute('data-focus-stop');
      if (existing !== null) return Number(existing);
      const next = document.querySelectorAll('[data-focus-stop]').length;
      el.setAttribute('data-focus-stop', String(next));
      return next;
    });
    if (index === -1) continue;
    if (index < focused.length) break; // came round again
    const control = page.locator(`[data-focus-stop="${index}"]`);
    focused.push(await readFocusStyle(control));
    labels.push(await labelOf(control));
  }

  // Focus elsewhere, then read every stop at rest.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await settleTransitions(page);
  const problems: string[] = [];
  for (const [i, focusedStyle] of focused.entries()) {
    const rest = await readFocusStyle(page.locator(`[data-focus-stop="${i}"]`));
    if (!showsFocus(rest, focusedStyle)) {
      problems.push(`${labels[i] ?? i}: no visible focus indicator`);
    }
  }
  return { stops: focused.length, problems };
};
