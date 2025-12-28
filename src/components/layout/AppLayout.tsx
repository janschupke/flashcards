import React from 'react';
import { AppTab } from '../../types/layout';
import { Navigation } from './Navigation';
import { FlashcardMode, HintType } from '../../types';
import { ToastContainer } from '../common/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  // Top controls props (only used in Flashcards tab)
  currentMode?: FlashcardMode;
  onModeChange?: (mode: FlashcardMode) => void;
  adaptiveRange?: number;
  correctAnswers?: number;
  totalSeen?: number;
  currentHint?: HintType;
  onTogglePinyin?: () => void;
  onToggleEnglish?: () => void;
  onReset?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  currentMode,
  onModeChange,
  adaptiveRange,
  correctAnswers,
  totalSeen,
  currentHint,
  onTogglePinyin,
  onToggleEnglish,
  onReset,
}) => {
  return (
    <div className="h-screen flex flex-col">
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentMode={currentMode}
        onModeChange={onModeChange}
        adaptiveRange={adaptiveRange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        currentHint={currentHint}
        onTogglePinyin={onTogglePinyin}
        onToggleEnglish={onToggleEnglish}
        onReset={onReset}
      />
      <main className="flex-1 overflow-hidden bg-surface-primary">{children}</main>
      <ToastContainer />
    </div>
  );
};
