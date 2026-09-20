import React from 'react';
import { useFlashCardContext } from '../contexts/FlashCardContext';
import { History } from '../components/feedback/History';
import { PageShell } from '../components/layout/PageShell';

export const HistoryPage: React.FC = () => {
  const { allAnswers } = useFlashCardContext();

  return (
    <PageShell title="Answer history">
      <History allAnswers={allAnswers} />
    </PageShell>
  );
};
