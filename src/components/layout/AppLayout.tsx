import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ToastContainer } from '../common/ToastContainer';
import { useFlashCardContext } from '../../contexts/FlashCardContext';
import { AppTab } from '../../types/layout';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const {
    adaptiveRange,
    correctAnswers,
    totalSeen,
    resetStatistics,
  } = useFlashCardContext();

  // Determine active tab from route
  const activeTab =
    location.pathname === '/'
      ? AppTab.FLASHCARDS
      : location.pathname === '/history'
        ? AppTab.HISTORY
        : location.pathname === '/statistics'
          ? AppTab.STATISTICS
          : location.pathname === '/about'
            ? AppTab.ABOUT
            : AppTab.FLASHCARDS;

  return (
    <div className="h-screen flex flex-col">
      <Navigation
        activeTab={activeTab}
        adaptiveRange={adaptiveRange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        onReset={resetStatistics}
      />
      <main className="flex-1 overflow-y-auto bg-surface-primary">{children}</main>
      <ToastContainer />
    </div>
  );
};
