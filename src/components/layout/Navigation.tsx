import React from 'react';
import { AppTab } from '../../types/layout';
import { NAVIGATION_CONSTANTS } from '../../constants/layout';
import { TabNavigation } from './TabNavigation';
import { TopControls } from './TopControls';
import { FlashcardMode, HintType } from '../../types';

interface NavigationProps {
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

export const Navigation: React.FC<NavigationProps> = ({
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
    <div className="bg-surface-secondary border-b border-border-primary">
      <nav className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-text-primary">{NAVIGATION_CONSTANTS.LOGO_TEXT}</h1>
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </nav>
      {activeTab === AppTab.FLASHCARDS &&
        currentMode !== undefined &&
        onModeChange &&
        adaptiveRange !== undefined &&
        correctAnswers !== undefined &&
        totalSeen !== undefined && (
          <TopControls
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
        )}
    </div>
  );
};
