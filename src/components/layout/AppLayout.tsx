import React from 'react';
import { AppTab } from '../../types/layout';
import { Navigation } from './Navigation';
import { FlashcardMode } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  // Top controls props (only used in Flashcards tab)
  currentMode?: FlashcardMode;
  onModeChange?: (mode: FlashcardMode) => void;
  currentLimit?: number;
  minLimit?: number;
  maxLimit?: number;
  onLimitChange?: (newLimit: number) => void;
  correctAnswers?: number;
  totalSeen?: number;
  onTogglePinyin?: () => void;
  onToggleEnglish?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  currentMode,
  onModeChange,
  currentLimit,
  minLimit,
  maxLimit,
  onLimitChange,
  correctAnswers,
  totalSeen,
  onTogglePinyin,
  onToggleEnglish,
}) => {
  return (
    <div className="h-screen flex flex-col">
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentMode={currentMode}
        onModeChange={onModeChange}
        currentLimit={currentLimit}
        minLimit={minLimit}
        maxLimit={maxLimit}
        onLimitChange={onLimitChange}
        correctAnswers={correctAnswers}
        totalSeen={totalSeen}
        onTogglePinyin={onTogglePinyin}
        onToggleEnglish={onToggleEnglish}
      />
      <main className="flex-1 overflow-hidden bg-surface-primary">{children}</main>
    </div>
  );
};
