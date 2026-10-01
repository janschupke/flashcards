import { expect, type Page } from '@playwright/test';
import characters from '../src/data/characters.json' with { type: 'json' };

/**
 * Page states the browser accessibility specs visit.
 *
 * A fresh profile shows empty tables and no success rates, which hides most
 * of the colour pairings, so most scenarios seed localStorage first. The
 * shapes must satisfy the parsers in src/utils/storageUtils.ts: a record that
 * fails validation is silently dropped and the page renders empty.
 */
interface Scenario {
  name: string;
  path: string;
  seed: boolean;
  /** Restrict to one Playwright project, e.g. the mobile menu. */
  project?: 'desktop' | 'mobile';
  /** Brings the page into the state under test after it has loaded. */
  setup?: (page: Page) => Promise<void>;
}

const SEED_SIZE = 40;

const answerFor = (characterIndex: number, isCorrect: boolean): Record<string, unknown> => {
  const character = characters[characterIndex];
  if (!character) throw new Error(`No character at index ${characterIndex}`);
  return {
    characterIndex,
    submittedPinyin: isCorrect ? character.pinyin : 'wrong',
    correctPinyin: character.pinyin,
    simplified: character.simplified,
    traditional: character.traditional,
    english: character.english,
    isCorrect,
  };
};

/**
 * Per-character rates spread across all three success-rate bands (mastered,
 * learning, struggling), so the statistics table renders every status colour.
 */
const seedStorage = (): Record<string, string> => {
  const history = Array.from({ length: SEED_SIZE }, (_, i) => answerFor(i, i % 3 !== 0));
  const performance = Array.from({ length: SEED_SIZE }, (_, i) => ({
    characterIndex: i,
    correct: i % 3,
    total: 2 + (i % 2),
    lastSeen: 1_700_000_000_000 + i,
  }));
  const correctAnswers = history.filter((a) => a['isCorrect'] === true).length;

  return {
    'flashcard-history': JSON.stringify(history),
    'flashcard-performance': JSON.stringify(performance),
    'flashcard-recent-answers': JSON.stringify(history.slice(-10)),
    'flashcard-counters': JSON.stringify({
      correctAnswers,
      totalSeen: SEED_SIZE,
      totalAttempted: SEED_SIZE,
      lastUpdated: 1_700_000_000_000,
    }),
    'flashcard-previous-answer': JSON.stringify(answerFor(0, false)),
    'flashcard-adaptive-range': JSON.stringify(100),
    'flashcard-schema-version': JSON.stringify(1),
  };
};

/**
 * Navigates to the scenario and waits until the page is interactive, not just
 * painted.
 *
 * react-tooltip binds its hover listener on `document` in a mount effect, so
 * a hover that arrives between first paint and that effect is lost for good:
 * the pointer then rests on the anchor and no further mouseover fires. On the
 * flashcard route, FlashcardPage focuses the answer field in its own mount
 * effect, and React runs every passive effect of a commit in one flush, so a
 * focused field means the tooltip's listener is bound too.
 */
export const openScenario = async (page: Page, scenario: Scenario): Promise<void> => {
  if (scenario.seed) {
    await page.addInitScript((entries) => {
      // Only on the first load: a reload must not undo what the test did.
      if (window.sessionStorage.getItem('seeded') !== null) return;
      window.sessionStorage.setItem('seeded', '1');
      for (const [key, value] of Object.entries(entries)) {
        window.localStorage.setItem(key, value);
      }
    }, seedStorage());
  }
  await page.goto(scenario.path);
  await page.locator('main *').first().waitFor();
  if (scenario.path === '/') {
    await expect(page.getByRole('textbox')).toBeFocused();
  }
  await scenario.setup?.(page);
};

/** Fails fast if seeding was dropped, rather than scanning an empty table. */
const expectSeededRows = async (page: Page): Promise<void> => {
  await expect(page.getByRole('table').getByRole('row').nth(5)).toBeVisible();
};

export const SCENARIOS: Scenario[] = [
  { name: 'flashcards, fresh', path: '/', seed: false },
  {
    name: 'flashcards, seeded',
    path: '/',
    seed: true,
    setup: async (page) => {
      await expect(page.getByTestId('stat-recent-success-rate')).toHaveText(/%/);
    },
  },
  {
    name: 'flashcards, wrong answer',
    path: '/',
    seed: true,
    setup: async (page) => {
      await page.getByRole('textbox').fill('zzz');
      await page.getByRole('textbox').press('Enter');
      await page.locator('[aria-live="polite"].text-error').waitFor();
    },
  },
  { name: 'history', path: '/history', seed: true, setup: expectSeededRows },
  { name: 'statistics', path: '/statistics', seed: true, setup: expectSeededRows },
  { name: 'about', path: '/about', seed: false },
  {
    name: 'reset dialog',
    path: '/',
    seed: true,
    setup: async (page) => {
      await page.getByRole('button', { name: 'Reset', exact: true }).click();
      await page.getByRole('dialog').waitFor();
    },
  },
  {
    name: 'range tooltip',
    path: '/',
    seed: true,
    project: 'desktop',
    setup: async (page) => {
      // react-tooltip's "debounce" is leading-edge: it runs the first show
      // trigger and DROPS every other for the next 50ms. Any focusin is a
      // trigger, including the answer field's autofocus that openScenario
      // just waited for, so a hover inside that window is swallowed (about
      // 1 run in 40). A page timer scheduled now with the same 50ms fires
      // after the library's, because timers run in the order they were
      // scheduled, so the window is closed when this resolves.
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 50)));
      await page.getByRole('button', { name: /Character range/ }).hover();
      await page.locator('#adaptive-range-tooltip').waitFor();
    },
  },
  {
    name: 'mobile menu',
    path: '/',
    seed: true,
    project: 'mobile',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      await page.getByRole('navigation', { name: 'Pages' }).getByRole('link').first().waitFor();
    },
  },
];
