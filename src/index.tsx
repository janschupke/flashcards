/* global document */

import { createRoot } from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { FlashCards } from './components/FlashCards';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
  }

  button {
    font-family: inherit;
  }

  input {
    font-family: inherit;
  }
`;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = createRoot(rootElement);
root.render(
  <>
    <GlobalStyle />
    <FlashCards />
  </>
);
