import React from 'react';
import { useFlashCardContext } from '../contexts/FlashCardContext';
import { IncorrectAnswers } from '../components/feedback/IncorrectAnswers';

export const HistoryPage: React.FC = () => {
  const { allAnswers } = useFlashCardContext();

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-screen-xl min-h-full">
        <IncorrectAnswers allAnswers={allAnswers} />
      </div>
    </div>
  );
};
