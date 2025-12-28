import React from 'react';
import { Answer, FlashcardMode } from '../../types';
import { Table } from '../common/Table';
import { TableVariant } from '../../types/components';
import { generateAnswerTableRows } from '../../utils/tableUtils';

interface IncorrectAnswersProps {
  allAnswers: Answer[];
}

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({ allAnswers }) => {

  // Reverse order to show newest first
  const reversedAnswers = [...allAnswers].reverse();

  const hasCharacterModes = allAnswers.some((answer) => answer.mode !== FlashcardMode.PINYIN);

  const headers = hasCharacterModes
    ? ['Simplified', 'Traditional', 'Expected', 'Submitted', 'English']
    : ['Simplified', 'Traditional', 'Pinyin', 'Submitted', 'English'];

  const rows = generateAnswerTableRows(reversedAnswers, hasCharacterModes);

  if (allAnswers.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm sm:text-base py-4 px-2 sm:px-4">
        No answers yet. Start practicing!
      </div>
    );
  }

  return <Table headers={headers} rows={rows} variant={TableVariant.BORDERED} />;
};
