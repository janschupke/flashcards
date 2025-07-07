/* global document */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FlashCards } from './components/FlashCards';

const root = createRoot(document.getElementById('root'));
root.render(<FlashCards />);
