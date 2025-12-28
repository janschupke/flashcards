import { createRoot } from 'react-dom/client';
import { TooltipProvider } from 'react-tooltip';
import { FlashCards } from './components/core/FlashCards';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';
import 'react-tooltip/dist/react-tooltip.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = createRoot(rootElement);
root.render(
  <TooltipProvider>
    <ToastProvider>
      <FlashCards />
    </ToastProvider>
  </TooltipProvider>
);
