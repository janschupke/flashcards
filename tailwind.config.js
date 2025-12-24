/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4: optional config. We keep it minimal and let @theme in CSS drive tokens.
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // Intentionally minimal; tokens come from @theme in CSS.
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '1.5rem',
      },
    },
  },
  plugins: [],
};