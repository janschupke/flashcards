import React from 'react';
import { Navigation } from './Navigation';
import { ToastContainer } from '../common/ToastContainer';
import { useFlashCardContext } from '../../contexts/FlashCardContext';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adaptiveRange, correctAnswers, totalSeen, allAnswers, resetStatistics } =
    useFlashCardContext();

  return (
    <div className="h-screen flex flex-col">
      <Navigation
        adaptiveRange={adaptiveRange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        allAnswers={allAnswers}
        onReset={resetStatistics}
      />
      <main className="flex-1 overflow-y-auto bg-surface-primary">{children}</main>
      <ToastContainer />
    </div>
  );
};
