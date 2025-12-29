import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppTab } from '../../types/layout';
import { NAVIGATION_CONSTANTS } from '../../constants/layout';
import { TabNavigation } from './TabNavigation';
import { MobileMenu } from './MobileMenu';
import { FlashcardStatsPanel } from './FlashcardStatsPanel';

interface NavigationProps {
  activeTab: AppTab;
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  onReset?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  adaptiveRange,
  correctAnswers,
  totalSeen,
  onReset,
}) => {
  const location = useLocation();
  const isFlashcardsPage = location.pathname === '/';

  return (
    <div className="bg-surface-secondary border-b border-border-primary">
      <nav className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-xl font-bold text-text-primary hover:text-primary cursor-pointer transition-colors">
              {NAVIGATION_CONSTANTS.LOGO_TEXT}
            </h1>
          </Link>
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
        <FlashcardStatsPanel
          adaptiveRange={adaptiveRange}
          correctAnswers={correctAnswers}
          totalSeen={totalSeen}
          onReset={onReset}
        />
      )}
    </div>
  );
};
