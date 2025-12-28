import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppTab } from '../../types/layout';
import { NAVIGATION_CONSTANTS } from '../../constants/layout';
import { TabNavigation } from './TabNavigation';
import { MobileMenu } from './MobileMenu';
import { TopControls } from './TopControls';
import { FlashcardMode, HintType } from '../../types';

interface NavigationProps {
  activeTab: AppTab;
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  currentHint?: HintType;
  onTogglePinyin?: () => void;
  onToggleEnglish?: () => void;
  onReset?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
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
  const location = useLocation();
  const isFlashcardsPage = location.pathname === '/';

  return (
    <div className="bg-surface-secondary border-b border-border-primary">
      <nav className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-text-primary">{NAVIGATION_CONSTANTS.LOGO_TEXT}</h1>
        </div>
        {/* Desktop navigation */}
        <div className="hidden md:block">
          <TabNavigation activeTab={activeTab} />
        </div>
        {/* Mobile menu */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </nav>
      {isFlashcardsPage && (
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
