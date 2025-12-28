import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { FlashCardProvider } from './contexts/FlashCardContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageTransition } from './components/layout/PageTransition';
import { FlashCardsContent } from './components/core/FlashCardsContent';
import { HistoryPage } from './pages/HistoryPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <FlashCardProvider>
        <AppLayout>
          <PageTransition>
            <Routes>
              <Route path="/" element={<FlashCardsContent />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </PageTransition>
        </AppLayout>
      </FlashCardProvider>
    </ToastProvider>
  );
};
