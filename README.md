# 汉字 Flashcards

A modern flashcard web app for practicing Chinese characters. This project helps learners master the 1,500 most common 汉字 (Chinese characters) with pinyin and English meanings.

**Live Demo:** [https://flashcards.schupke.io](https://flashcards.schupke.io)

---

## Features

- **Three Flashcard Modes:**
  - **拼音 (Pinyin):** Show characters and type pinyin (default mode)
  - **简体 (Simplified):** Show traditional characters and type simplified characters
  - **繁体 (Traditional):** Show simplified characters and type traditional characters
- **Interactive Flashcards:** Practice Chinese characters with instant feedback.
- **Pinyin Input & Evaluation:** Type pinyin and get instant feedback on accuracy.
- **Character Input & Evaluation:** Type Chinese characters and get instant feedback.
- **Hint System:** Toggle pinyin and English hints for each character.
- **Progress Tracking:** See your progress and statistics as you learn.
- **Keyboard Shortcuts:** Quickly reveal hints, switch modes, or move to the next card.
- **Custom Range:** Choose how many characters to study in a session (dynamic ranges per mode).
- **Traditional Character Support:** View traditional characters alongside simplified.
- **Incorrect Answers Tracking:** Review your mistakes and learn from them.
- **Previous Character Display:** See the last character you studied.
- **Responsive Design:** Works great on desktop and mobile.

---

## Keyboard Shortcuts

- **Enter:** Move to next character
- **F1:** Switch to Pinyin mode
- **F2:** Switch to Simplified mode  
- **F3:** Switch to Traditional mode
- **Left Arrow:** Switch to previous mode
- **Right Arrow:** Switch to next mode
- **Comma (,):** Toggle pinyin hint
- **Period (.):** Toggle English hint
- **Arrow Up/Down:** Adjust character range

---

## Data Source

- Contains the 1,500 most common Chinese characters.
- Each entry includes: 汉字 (simplified), pinyin, English meaning, and traditional character mapping.
- Traditional characters are automatically generated using a comprehensive mapping system.
- **Mode-specific filtering:** Simplified and Traditional modes only use characters where simplified ≠ traditional (539 characters).

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
- 120+ tests covering all major functionality including new flashcard modes.

### Linting & Formatting
```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run fix
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

#### Troubleshooting
- Check build logs in the Vercel dashboard if deployment fails.
- Verify TypeScript compilation locally: `npm run build`
- Check for linting errors: `npm run lint`
- Ensure all dependencies are in `package.json`

---

## Tech Stack
- **React 19.1.0**
- **Vite 7.0.2**
- **TypeScript 5.8.3**
- **styled-components 6.1.19** (React 19+ compatible)
- **Vitest 3.2.4** (unit testing)
- **Testing Library** (React component testing)
