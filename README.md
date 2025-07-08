# 汉字 Flashcards

A modern flashcard web app for practicing Simplified Chinese characters. This project helps learners master the 1,500 most common 汉字 (Chinese characters) with pinyin and English meanings. Built with React 19, Vite, and styled-components v6 for a fast, accessible, and mobile-friendly experience.

**Live Demo:** [https://hanzi-flashcards-nine.vercel.app/](https://hanzi-flashcards-nine.vercel.app/)

---

## Features

- **Interactive Flashcards:** Practice Chinese characters with instant feedback.
- **Hint System:** Toggle pinyin and English hints for each character.
- **Progress Tracking:** See your progress and stats as you learn.
- **Keyboard Shortcuts:** Quickly reveal hints or move to the next card.
- **Custom Range:** Choose how many characters to study in a session.
- **Responsive Design:** Works great on desktop and mobile.

---

## Data Source

- Contains the 1,500 most common Simplified Chinese characters.
- Data file adapted from [Sensible Chinese](https://sensiblechinese.com/common-chinese-characters).
- Each entry includes: 汉字, pinyin, English meaning, and a unique sound ID.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/janschupke/hanzi-flashcards.git
cd hanzi-flashcards

# Install dependencies
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing
Run all tests with:
```bash
npm run test
```
- Uses [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).

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
- **React 19**
- **Vite**
- **TypeScript**
- **styled-components v6** (React 19+ compatible)
- **Vitest** (unit testing)

---

## License
MIT

---

## Credits
- Data: [Sensible Chinese](https://sensiblechinese.com/common-chinese-characters)
- Author: [Jan Schupke](mailto:jan@schupke.io)
