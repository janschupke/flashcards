import React from 'react';
import { Navigation } from './Navigation';
import { ToastContainer } from '../common/ToastContainer';
import { useFlashCardContext } from '../../contexts/FlashCardContext';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adaptiveRange, correctAnswers, totalSeen, allAnswers, resetStatistics } =
    useFlashCardContext();

  return (
    <div className="h-screen flex flex-col">
      {/* Visible only once focused, so keyboard users can bypass the nav. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-text-on-primary"
      >
        Skip to main content
      </a>
      <Navigation
        adaptiveRange={adaptiveRange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        allAnswers={allAnswers}
        onReset={resetStatistics}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 overflow-y-auto bg-surface-primary focus:outline-none"
      >
        {children}
      </main>
      <ToastContainer />
    </div>
  );
};
