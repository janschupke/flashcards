import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ToastContainer } from '../common/ToastContainer';
import { useFlashCardContext } from '../../contexts/FlashCardContext';
import { getActiveTabFromPath } from '../../utils/routingUtils';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { adaptiveRange, correctAnswers, totalSeen, resetStatistics } = useFlashCardContext();

  // Determine active tab from route
  const activeTab = getActiveTabFromPath(location.pathname);

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
