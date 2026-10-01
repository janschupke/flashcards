# 汉字 Flashcards

An adaptive flashcard app for the 1,500 most common Chinese characters. You are shown a character and type its pinyin; the app tracks how you do on each one and keeps putting the ones you are struggling with in front of you.

**Live demo:** [https://flashcards.schupke.io](https://flashcards.schupke.io)

---

## Features

### Practice

- **Three display modes:** 全部 (both, F1), 简体 (simplified, F2), 繁体 (traditional, F3).
- **Pinyin input,** whichever mode you are in. Matching is **tone-insensitive**: tone marks and tone numbers are stripped before comparison, so `wo`, `wǒ` and `wo4` are all accepted for 我. `v` is accepted for `ü`.
- **Instant feedback:** a coloured border and a ✓/✗ flash on submit, announced to screen readers.
- **Hints** for pinyin and English, from the buttons or the keyboard.

### Adaptive selection

Characters in your current range fall into three tiers, each with a fixed share of the draws:

| Tier           | Definition                     | Share of draws |
| -------------- | ------------------------------ | -------------- |
| **Struggling** | below 50% success, ≥ 1 attempt | 50%            |
| **Untested**   | never attempted                | 30%            |
| **Mastered**   | 50% success or better          | 20%            |

Within the struggling and mastered tiers, a character's weight is `(1 − successRate)² ÷ (1 + 0.5 × attempts)` — worse and less-practised ranks higher than worse but heavily drilled. Untested characters are drawn uniformly. 15% of each tier's share is spread evenly across its members so no single character can take over its tier.

Two things worth knowing:

- **The shares are a budget, not a guarantee.** An empty tier's share is redistributed across the tiers that have members, so once everything in range is mastered, mastered characters get 100% of the draws.
- **The character you just answered is never shown twice in a row**, as long as there is anything else in range.

Adaptive selection starts as soon as any character in range has one attempt. Before that, selection is uniformly random.

### Range expansion

- Starts at the first **100** characters, grows to all **1,500**.
- Expands by **+10** when **≥ 80%** of your **last 10 answers** are correct.
- That window is **rolling and checked after every answer** once you have ten of them, not on every tenth answer. It restarts after each expansion, and it survives a page reload.
- **The range only grows.** Dropping below 80% does not shrink it back.
- A toast appears when it expands.

### Statistics and history

- Per-character success rates, colour-coded: 🟢 ≥ 80%, 🟡 50–79%, 🔴 < 50%.
- Sortable by character, correct count, attempts or success rate; filterable to all / struggling / mastered.
- Last 100 answers in History.
- Search across both tables, with the same pinyin normalisation used for answers.
- Each character links to its [Purple Culture](https://www.purpleculture.net/) dictionary entry.

### Persistence

Everything lives in `localStorage` under `flashcard-*` keys and is validated on read: records that fail validation are dropped rather than allowed to corrupt selection. A `flashcard-schema-version` key marks the shape. Clearing your data is available from the Reset button, behind a confirmation.

### Accessibility

Checked at three levels, all of which gate CI, plus `eslint-plugin-jsx-a11y`:

- **jsdom axe tests** (`src/test/a11y.test.tsx`) check structure: labels, landmarks, roles, table semantics. `axe` cannot evaluate colour contrast under jsdom, which has no layout, so that rule is disabled there rather than silently reported as passing.
- **Token tests** (`src/test/tokens.test.ts`) read the `@theme` block in `src/index.css` and check every real colour pairing: text on each surface clears WCAG AA (4.5:1), inverse text clears it on each fill at rest, hover and active, and each rest → hover step is at least 0.035 OKLab ΔE apart. Contrast ratio only measures luminance, so it can't tell you whether a hover is visible at all.
- **Browser tests** (`e2e/`, Playwright + `@axe-core/playwright`) run against the built bundle in Chromium. `a11y.spec.ts` runs a full axe scan with contrast on for each page state (fresh and seeded, wrong answer, reset dialog, tooltip, mobile menu) at desktop and phone widths. `interaction-states.spec.ts` hovers every control and checks that the hover is visible and still passes axe contrast, then Tabs through each page and checks that every stop shows a focus indicator. A negative control proves the hover probe rejects both of the old failing hover styles.

There is a skip link, every route has a heading, tables are captioned with scoped headers, sortable headers are real buttons, the reset dialog traps focus, and `prefers-reduced-motion` is honoured.

---

## Keyboard shortcuts

| Key                    | Action                               |
| ---------------------- | ------------------------------------ |
| `Enter`                | Submit the answer and advance        |
| `F1` / `F2` / `F3`     | Both / simplified / traditional mode |
| `←` / `→`              | Previous / next display mode         |
| `Cmd`+`.` / `Ctrl`+`.` | Toggle the pinyin hint               |
| `Cmd`+`/` / `Ctrl`+`/` | Toggle the English hint              |

The hint shortcuts need a modifier because the answer field keeps focus at all times — an unmodified `.` or `/` would be swallowed instead of typed. `Cmd`+`,` is unavailable: every browser binds it to its own settings on macOS. The arrow keys are ignored while a text field has focus, so they still move the caret. Mode switching does not wrap at either end.

---

## Getting started

### Prerequisites

- **Node.js 22.12 or newer.** Vite 7 requires `^20.19 || >=22.12`, and Vitest 5 requires `>=22.12`. CI runs Node 22.
- **npm.** Only `package-lock.json` is committed, and CI uses `npm ci`; yarn or pnpm would produce a divergent tree.

### Install and run

```bash
git clone https://github.com/janschupke/flashcards.git
cd flashcards
npm install
npm run dev
```

The dev server listens on **http://localhost:3000** (set in `vite.config.ts`). It does not open a browser for you.

### Scripts

| Script                  | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Dev server on port 3000                                |
| `npm run build`         | Typecheck, then build to `dist/`                       |
| `npm run preview`       | Serve the built bundle on port 4173                    |
| `npm run test`          | Run the test suite once                                |
| `npm run test:coverage` | Run with coverage and enforce the 80% threshold        |
| `npm run test:e2e`      | Build, then run the Playwright accessibility tests     |
| `npm run typecheck`     | `tsc --noEmit`                                         |
| `npm run lint`          | ESLint over the whole project, zero warnings tolerated |
| `npm run lint:fix`      | ESLint with `--fix`                                    |
| `npm run format`        | Prettier write                                         |
| `npm run format:check`  | Prettier check                                         |
| `npm run knip`          | Unused files, exports and dependencies                 |
| `npm run check`         | All of the above, in the order CI runs them            |

### Testing

[Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) and jsdom. **420 tests across 40 files.** Coverage is gated at **80%** for statements, branches, functions and lines.

`src/test/test-utils.tsx` provides `renderWithProviders`, `renderWithRouter` and `expectNoA11yViolations`; use them rather than re-wrapping components at each call site.

The browser tests need Chromium once: `npx playwright install chromium`. They run one worker against `npm run preview`, never a leftover server. Page states live in `e2e/scenarios.ts`, which seeds `localStorage` in the shapes `src/utils/storageUtils.ts` accepts.

---

## Continuous integration

`.github/workflows/pr-checks.yml` runs on every pull request and on pushes to `master`/`main`, on Node 22. It runs knip, typecheck, tests with coverage, lint, format check, build and the Playwright accessibility tests — the same steps as `npm run check`, in the same order, so a green local run means a green CI run.

---

## Deployment

Configured for [Vercel](https://vercel.com/): framework preset Vite, build `npm run build`, output `dist`. `vercel.json` rewrites all routes to `index.html` so `/history` and `/statistics` resolve on a hard refresh. No environment variables are needed. Pushes to the default branch deploy automatically; pull requests get preview deployments.

To check a production build locally:

```bash
npm run build
npm run preview
```

---

## Tech stack

React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, TanStack Table 8, React Router 7, Vitest 5. Exact versions live in `package.json`; they are not repeated here because a hand-copied list drifts on the first install.

---

## Configuration

Adaptive parameters live in [`src/constants/adaptive.ts`](src/constants/adaptive.ts) and are the single source of truth — the in-app **About** page renders its numbers from them, so it cannot drift. Read that file rather than a copy pasted here.

---

## Project structure

```
src/
├── components/
│   ├── common/      Button, Card, ConfirmModal, ErrorBoundary,
│   │                FilterButton, PaginatedTable, SearchInput, Toast
│   ├── controls/    ControlButtons, FlashcardControls, ModeButtonGroup
│   ├── core/        FlashcardPage, CharacterDisplay
│   ├── feedback/    About, History, Statistics, PreviousCharacter,
│   │                CharacterInfoColumn
│   ├── input/       FlashcardInput
│   └── layout/      AppLayout, Navigation, TabNavigation, TabButton,
│                    MobileMenu, PageShell, PageTransition,
│                    FlashcardStatsPanel
├── constants/       adaptive, layout, modes, routes
├── contexts/        FlashCardContext, ToastContext
├── data/            characters.json (1,500 entries)
├── hooks/           useFlashCard, useStatistics, useKeyboardShortcuts,
│                    useModeNavigation, useModeToggle, useFlashAnimation,
│                    useInputVariant
├── pages/           HistoryPage, StatisticsPage, AboutPage
├── test/            setup, test-utils, a11y smoke tests, colour/token gate
├── types/           shared types and enums
└── utils/           adaptiveUtils, storageUtils, flashcardStateUtils,
                     keyboardUtils, pinyinUtils, tableUtils, ...
```

The flashcard route renders `components/core/FlashcardPage`; the other three routes are thin wrappers in `pages/`.

---

## License

[MIT](LICENSE)
