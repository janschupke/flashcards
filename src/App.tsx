import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { FlashCardProvider } from './contexts/FlashCardContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageTransition } from './components/layout/PageTransition';
import { FlashcardPage } from './components/core/FlashcardPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AboutPage } from './pages/AboutPage';
import { ROUTES } from './constants/routes';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <FlashCardProvider>
        <AppLayout>
          <PageTransition>
            <Routes>
              <Route path={ROUTES.FLASHCARDS} element={<FlashcardPage />} />
              <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
              <Route path={ROUTES.STATISTICS} element={<StatisticsPage />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
            </Routes>
          </PageTransition>
        </AppLayout>
      </FlashCardProvider>
    </ToastProvider>
  );
};
