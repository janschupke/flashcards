import React from 'react';
import { useFlashCard } from '../hooks/useFlashCard';
import { IncorrectAnswers } from '../components/feedback/IncorrectAnswers';

export const HistoryPage: React.FC = () => {
  const { allAnswers } = useFlashCard();

  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-screen-xl">
      <IncorrectAnswers allAnswers={allAnswers} />
    </div>
  );
};

