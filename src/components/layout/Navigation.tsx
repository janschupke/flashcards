import React from 'react';
import { AppTab } from '../../types/layout';
import { NAVIGATION_CONSTANTS } from '../../constants/layout';
import { TabNavigation } from './TabNavigation';
import { TopControls } from './TopControls';
import { FlashcardMode } from '../../types';

interface NavigationProps {
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

export const Navigation: React.FC<NavigationProps> = ({
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
    <div className="bg-surface-secondary border-b border-border-primary">
      <nav className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-text-primary">
            {NAVIGATION_CONSTANTS.LOGO_TEXT}
          </h1>
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </nav>
      {activeTab === AppTab.FLASHCARDS &&
        currentMode !== undefined &&
        onModeChange &&
        currentLimit !== undefined &&
        minLimit !== undefined &&
        maxLimit !== undefined &&
        onLimitChange &&
        correctAnswers !== undefined &&
        totalSeen !== undefined && (
          <TopControls
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
        )}
    </div>
  );
};
