# 汉字 Flashcards

A modern adaptive learning flashcard web app for practicing Chinese characters. This project helps learners master the 1,500 most common 汉字 (Chinese characters) with pinyin and English meanings through an intelligent adaptive learning system.

**Live Demo:** [https://flashcards.schupke.io](https://flashcards.schupke.io)

---

## Features

### Core Learning Features
- **Three Display Modes:**
  - **全部 (Both) - F1:** Show both simplified and traditional characters, type pinyin (default mode)
  - **简体 (Simplified) - F2:** Show only simplified character, type pinyin
  - **繁体 (Traditional) - F3:** Show only traditional character, type pinyin
- **Interactive Flashcards:** Practice Chinese characters with instant feedback
- **Pinyin Input & Evaluation:** Always type pinyin and get instant feedback on accuracy (regardless of display mode)
- **Hint System:** Toggle pinyin and English hints for each character (buttons in top panel)
- **Keyboard Shortcuts:** Quickly reveal hints, switch display modes, or move to the next card

### Adaptive Learning System
- **Intelligent Character Selection:** The app uses a weighted algorithm that shows characters you're struggling with more often, while ensuring no character appears more than 50% of the time
- **Progressive Range Expansion:** Starts with the first 100 characters and automatically expands your practice range as you improve (every 10 answers, expands by 10 if success rate ≥80%)
- **Performance Tracking:** Tracks correct/incorrect answers for each character individually
- **Adaptive Range Display:** Shows current practice range (e.g., "1-100") on the main page

### Statistics & Progress
- **Per-Character Statistics:** View detailed performance data for each character you've practiced
- **Success Rate Tracking:** See which characters you've mastered (≥80%), are learning (50-79%), or struggling with (<50%)
- **Color-Coded Statistics:** Green for mastered, yellow for learning, red for struggling
- **Sortable Statistics:** Sort by character, correct count, total attempts, or success rate
- **Filterable Statistics:** Filter to show all, struggling, or mastered characters
- **Answer History:** Review your last 100 answers with color-coded correct/incorrect status
- **Previous Answer Display:** See the last character you studied with your submitted answer

### Data Persistence
- **Local Storage:** All progress, statistics, and history are saved locally in your browser
- **Cross-Session Persistence:** Your data persists across page refreshes and browser sessions
- **Reset Functionality:** Reset all statistics with confirmation modal (keeps current character/mode)

### User Interface
- **Responsive Design:** Works great on desktop and mobile devices
- **Toast Notifications:** Visual feedback when your practice range expands
- **About Section:** Comprehensive documentation explaining the app and adaptive algorithm
- **Tab Navigation:** Easy access to Flashcards, History, Statistics, and About sections

---

## Keyboard Shortcuts

- **Enter:** Submit answer and move to next character
- **F1:** Switch to Pinyin mode
- **F2:** Switch to Simplified mode
- **F3:** Switch to Traditional mode
- **Left Arrow:** Switch to previous mode
- **Right Arrow:** Switch to next mode
- **Comma (,):** Toggle pinyin hint
- **Period (.):** Toggle English hint

---

## Adaptive Learning System Explained

### Character Selection Algorithm
The app uses a weighted random selection algorithm that prioritizes characters based on their success rate:

**Priority Categories (highest to lowest):**
1. **Low Success Rate (0-30%)** - Gets 50% of selection probability
   - Characters struggling the most get the highest priority
   - Shared equally among all low success characters
   - Not constrained by maximum selection chance to ensure prioritization
2. **Untested Characters** - Gets 20% of selection probability
   - Characters you haven't practiced yet
   - Shared equally among all untested characters
3. **Medium Success Rate (30-70%)** - Gets 20% of selection probability
   - Weighted by inverse success rate (lower = higher weight)
4. **High Success Rate (70-100%)** - Gets 10% of selection probability
   - Weighted by inverse success rate (lower = higher weight)

**Configuration:**
- Minimum selection chance: 10%
- Maximum selection chance: 50% (does not apply to low success entries)
- Weight multiplier: 2.0x (for medium/high success categories)
- Minimum attempts for adaptive: 3 (or 1 attempt for low success entries)
- Low success threshold: 30%
- Medium success threshold: 70%
- Priority allocations: 50% low, 20% untested, 20% medium, 10% high

### Range Expansion
The app automatically expands your practice range as you improve:
- **Starting Range:** First 100 characters
- **Expansion Check:** Every 10 answers
- **Expansion Criteria:** ≥80% success rate with at least 10 attempts
- **Expansion Amount:** +10 characters per expansion
- **Maximum Range:** 1,500 characters (full dataset)

When your range expands, you'll see a toast notification at the top of the screen.

---

## Data Source

- Contains the 1,500 most common Chinese characters
- Each entry includes: 汉字 (simplified), traditional character, pinyin, and English meaning
- All modes support the full 1,500 character dataset
- Traditional characters are included for all entries

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/janschupke/flashcards.git
cd flashcards

# Install dependencies
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing
Run all tests with:
```bash
npm run test
```
- Uses [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).
- Comprehensive test coverage including components, hooks, and utilities.

Run tests with coverage:
```bash
npm run coverage
```

### Linting & Formatting
```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run fix
```

### Type Checking
```bash
npm run typecheck
```

---

## Building for Production
Create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## Deployment

### Vercel (Recommended)
This project is pre-configured for [Vercel](https://vercel.com/):
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** Vite
- **No environment variables required**
- **SPA Routing:** Configured via `vercel.json` to rewrite all routes to `index.html`.

#### Steps:
1. Push your code to GitHub or GitLab.
2. Import the repository into Vercel.
3. Vercel will auto-detect the settings and deploy your app.

#### Local Production Testing
Test the production build locally before deploying:
```bash
npm run build
npm run preview
```

---

## Tech Stack
- **React 19.1.0**
- **Vite 7.0.2**
- **TypeScript 5.8.3**
- **Tailwind CSS** (styling)
- **Vitest 3.2.4** (unit testing)
- **Testing Library** (React component testing)

---

## Configuration

All adaptive learning parameters can be configured in `src/constants/adaptive.ts`:

```typescript
export const ADAPTIVE_CONFIG = {
  // Character Selection
  MIN_SELECTION_CHANCE: 0.1,        // Minimum probability for any character
  MAX_SELECTION_CHANCE: 0.5,        // Maximum probability (never over 50%)
  WEIGHT_MULTIPLIER: 2.0,           // How much to favor struggling characters
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,     // Attempts needed before adaptive kicks in

  // Range Expansion
  INITIAL_RANGE: 100,                // Starting character count
  EXPANSION_INTERVAL: 10,            // Check every N answers
  EXPANSION_AMOUNT: 10,              // Add N characters when expanding
  SUCCESS_THRESHOLD: 0.8,            // 80% success rate required
  MIN_ATTEMPTS_FOR_EXPANSION: 10,    // Minimum attempts before checking

  // Storage
  MAX_HISTORY_ENTRIES: 100,          // Maximum history entries to store
} as const;
```

---

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components (Button, Table, Toast, etc.)
│   ├── controls/       # Control components (ModeButtonGroup, etc.)
│   ├── feedback/       # Feedback components (PreviousCharacter, Statistics, About, etc.)
│   ├── input/          # Input components (PinyinInput, CharacterInput, etc.)
│   ├── layout/         # Layout components (AppLayout, Navigation, etc.)
│   └── core/           # Core components (FlashCards, CharacterDisplay, etc.)
├── contexts/           # React contexts (ToastContext)
├── constants/          # Configuration constants
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── adaptiveUtils.ts    # Adaptive selection algorithm
│   ├── storageUtils.ts    # Local storage utilities
│   ├── characterUtils.ts   # Character-related utilities
│   └── ...
└── data/               # Data files (characters.json)
```

---

## License

MIT
