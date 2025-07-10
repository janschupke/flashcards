/* global document */

import { createRoot } from 'react-dom/client';
import { FlashCards } from './components/core/FlashCards';
import { GlobalStyle } from './theme/styled';

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
