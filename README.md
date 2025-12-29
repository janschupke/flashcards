# 汉字 Flashcards

A modern, adaptive learning flashcard web application for mastering Chinese characters. Practice the 1,500 most common 汉字 (Chinese characters) through an intelligent system that adapts to your learning progress, prioritizing characters you struggle with while ensuring comprehensive practice.

**Live Demo:** [https://flashcards.schupke.io](https://flashcards.schupke.io)

---

## Features

### Core Learning Features
- **Three Display Modes:**
  - **全部 (Both) - F1:** Display both simplified and traditional characters side-by-side
  - **简体 (Simplified) - F2:** Display only simplified character
  - **繁体 (Traditional) - F3:** Display only traditional character
- **Pinyin-Only Input:** Always type pinyin pronunciation regardless of display mode
- **Instant Feedback:** Real-time visual feedback with color-coded borders (green for correct, red for incorrect)
- **Flash Animations:** Visual flash effects when submitting answers
- **Hint System:** Toggle pinyin and English hints with keyboard shortcuts or buttons
- **Keyboard Shortcuts:** Full keyboard support for efficient practice

### Adaptive Learning System
- **Progressive Character Selection:** 80% of selections prioritize struggling/new characters with progressive weighting, 20% for successful ones
- **Weighted Random Selection:** Characters weighted by inverse success rate within each group
- **Progressive Range Expansion:** Automatically expands from 100 to 1,500 characters as you improve
- **Performance Tracking:** Individual tracking for each character's success rate
- **Adaptive Thresholds:** Characters with <50% success rate are prioritized

### Statistics & Progress Tracking
- **Per-Character Statistics:** Detailed performance metrics for each character
- **Success Rate Categories:**
  - 🟢 **Mastered:** ≥80% success rate
  - 🟡 **Learning:** 50-79% success rate
  - 🔴 **Struggling:** <50% success rate
- **Sortable & Filterable:** Sort by character, correct count, total attempts, or success rate
- **Filter Options:** View all, struggling only, or mastered characters
- **Answer History:** Review last 100 answers with color-coded status
- **Previous Answer Display:** See your last answer with feedback

### Search & Navigation
- **Real-time Search:** Search across all columns in History and Statistics
- **Pinyin Normalization:** Search handles tone variations and ü/u alternatives
- **Dictionary Links:** Click any row to open Purple Culture dictionary page
- **Responsive Tables:** Paginated tables with customizable page size

### Data Persistence
- **Local Storage:** All progress saved in browser localStorage
- **Cross-Session Persistence:** Data persists across refreshes and sessions
- **Reset Functionality:** Clear all data with confirmation modal

### User Interface
- **Responsive Design:** Optimized for desktop, tablet, and mobile
- **Toast Notifications:** Visual feedback for range expansions
- **Smooth Animations:** Fade-in modals, page transitions, and character displays
- **Accessible:** Keyboard navigation and ARIA labels
- **Modern UI:** Clean design with Tailwind CSS

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
The app uses a simple weighted selection algorithm that ensures characters you're struggling with or that are new get prioritized:

**Selection Distribution:**
- **80% of selections** come from unsuccessful or new characters
  - Prioritizes characters you're struggling with
  - Ensures new characters in your range get practice
  - Progressive weighting: lower success rate and fewer attempts = exponentially higher priority
  - Prevents over-showing characters with many failed attempts
- **20% of selections** come from successful characters
  - Maintains exposure to characters you've mastered
  - Reduced weight for high success with many attempts
  - Prevents repeatedly showing the same mastered characters

**Character Categories:**
1. **Unsuccessful/Untested Characters** (<50% success OR 0 attempts)
   - 80% of all selections
   - Progressive weighting: (1 - successRate)² × attempt_penalty
   - Untested characters get highest priority (weight = 1.0)
   - Lower success rate and fewer attempts = exponentially higher weight
2. **Successful Characters** (≥50% success rate)
   - 20% of all selections
   - Reduced weight for high success with many attempts
   - Prevents over-showing mastered characters

**Configuration:**
- Unsuccessful threshold: <50% success rate
- Selection distribution: 80% unsuccessful/untested, 20% successful
- Progressive weighting: prioritizes low success rates and low attempt counts

### Range Expansion
The app automatically expands your practice range as you improve:
- **Starting Range:** First 100 characters
- **Expansion Check:** Every 10 answers (EXPANSION_INTERVAL)
- **Expansion Criteria:**
  - ≥80% success rate in your **last 10 answers**
  - Must have at least 10 answers total
- **Expansion Amount:** +10 characters per expansion
- **Maximum Range:** 1,500 characters (full dataset)

**Note:** The success rate is calculated from your **last 10 answers only** (rolling window). This ensures expansion is based on recent performance, not historical performance. The system checks this every 10 answers.

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
- **Node.js** v18 or newer ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn** or **pnpm**

### Development Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/janschupke/flashcards.git
   cd flashcards
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) (Vite default port)

4. **Open in browser:**
   - The dev server will automatically open, or navigate to the URL shown in the terminal

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:ui

# Type checking (TypeScript)
npm run typecheck

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run all checks (knip, typecheck, test, lint, format, build)
npm run check
```

### Testing
- **Test Framework:** [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/)
- **Coverage:** 191 tests covering components, hooks, utilities, and algorithms
- **Run Tests:** `npm run test` or `npm run test:coverage` for coverage report

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

### Vercel Deployment (Recommended)

This project is pre-configured for [Vercel](https://vercel.com/) with optimal settings for a React SPA.

#### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier works)
- Your code pushed to GitHub, GitLab, or Bitbucket

#### Deployment Steps

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Vercel will auto-detect the following settings:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a production URL (e.g., `your-app.vercel.app`)

#### Vercel Configuration

The project includes `vercel.json` for SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes (e.g., `/history`, `/statistics`) work correctly in production.

#### Environment Variables

**No environment variables required** - the app works out of the box with default settings.

#### Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

#### Continuous Deployment

- Every push to `main` branch triggers automatic deployment
- Pull requests get preview deployments automatically
- Deployments are instant and zero-downtime

#### Local Production Testing

Before deploying, test the production build locally:
```bash
# Build the production bundle
npm run build

# Preview the production build
npm run preview
```

This serves the optimized build at `http://localhost:4173` (or similar) to verify everything works correctly.

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
  // Selection algorithm
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,     // Attempts needed before adaptive selection activates

  // Success rate threshold for categorization
  UNSUCCESSFUL_THRESHOLD: 0.5,      // <50% = unsuccessful (untested also in this group)

  // Weighting constants
  UNTESTED_WEIGHT: 1.0,             // Weight for untested characters (highest priority)
  SELECTION_SPLIT: 0.8,             // 80% for unsuccessful/untested, 20% for successful
  ATTEMPT_PENALTY_FACTOR: 0.5,      // Factor to reduce weight for characters with many attempts
  SUCCESS_PENALTY_EXPONENT: 2.0,    // Exponent for progressive success rate penalty

  // Range expansion
  INITIAL_RANGE: 100,               // Starting character count
  EXPANSION_INTERVAL: 10,           // Check every N answers (rolling window size)
  EXPANSION_AMOUNT: 10,             // Add N characters when expanding
  SUCCESS_THRESHOLD: 0.8,           // 80% success rate required for expansion (in last N answers)
  // Note: MIN_ATTEMPTS_FOR_EXPANSION is no longer used - expansion checks when recentAnswers.length >= EXPANSION_INTERVAL

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,         // Maximum history entries to store
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
