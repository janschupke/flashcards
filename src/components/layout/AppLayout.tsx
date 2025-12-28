import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ToastContainer } from '../common/ToastContainer';
import { useFlashCard } from '../../hooks/useFlashCard';
import { HINT_TYPES } from '../../types';
import { AppTab } from '../../types/layout';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const {
    mode,
    adaptiveRange,
    correctAnswers,
    totalSeen,
    hint,
    toggleHint,
    setMode,
    resetStatistics,
  } = useFlashCard();

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
        currentMode={mode}
        onModeChange={setMode}
        adaptiveRange={adaptiveRange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        currentHint={hint}
        onTogglePinyin={() => toggleHint(HINT_TYPES.PINYIN)}
        onToggleEnglish={() => toggleHint(HINT_TYPES.ENGLISH)}
        onReset={resetStatistics}
      />
      <main className="flex-1 overflow-hidden bg-surface-primary">{children}</main>
      <ToastContainer />
    </div>
  );
};
