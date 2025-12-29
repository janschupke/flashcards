import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NAVIGATION_CONSTANTS } from '../../constants/layout';
import { ROUTES } from '../../constants/routes';
import { TabNavigation } from './TabNavigation';
import { MobileMenu } from './MobileMenu';
import { FlashcardStatsPanel } from './FlashcardStatsPanel';
import { Answer } from '../../types';

interface NavigationProps {
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  allAnswers: Answer[];
  onReset?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  adaptiveRange,
  correctAnswers,
  totalSeen,
  allAnswers,
  onReset,
}) => {
  const location = useLocation();
  const isFlashcardsPage = location.pathname === ROUTES.FLASHCARDS;

  return (
    <div className="bg-surface-secondary border-b border-border-primary">
      <nav className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link to={ROUTES.FLASHCARDS} className="no-underline">
            <h1 className="text-xl font-bold text-text-primary hover:text-primary cursor-pointer transition-colors">
              {NAVIGATION_CONSTANTS.LOGO_TEXT}
            </h1>
          </Link>
        </div>
        {/* Desktop navigation */}
        <div className="hidden md:block">
          <TabNavigation />
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
          allAnswers={allAnswers}
          onReset={onReset}
        />
      )}
    </div>
  );
};
