import React from 'react';
import { IncorrectAnswer, FlashcardMode } from '../../types';
import { Table } from '../common/Table';
import { TableVariant } from '../../types/components';

interface IncorrectAnswersProps {
  incorrectAnswers: IncorrectAnswer[];
}

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({ incorrectAnswers }) => {
  const getSubmittedColumn = (answer: IncorrectAnswer): string => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.submittedPinyin;
    } else {
      return answer.submittedCharacter ?? '(empty)';
    }
  };

  const getCorrectColumn = (answer: IncorrectAnswer): string => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.correctPinyin;
    } else {
      return answer.correctCharacter ?? '';
    }
  };

  const hasCharacterModes = incorrectAnswers.some((answer) => answer.mode !== FlashcardMode.PINYIN);

  const headers = hasCharacterModes
    ? ['Simplified', 'Traditional', 'Expected', 'Submitted', 'English']
    : ['Simplified', 'Traditional', 'Pinyin', 'Submitted', 'English'];

  const rows = incorrectAnswers.map((answer) => {
    const submitted = getSubmittedColumn(answer);
    const correct = getCorrectColumn(answer);

    if (hasCharacterModes) {
      return [
        <span key="simplified" className="text-text-secondary">
          {answer.simplified}
        </span>,
        <span key="traditional" className="text-text-secondary">
          {answer.traditional}
        </span>,
        <span key="correct" className="text-text-secondary">
          {correct}
        </span>,
        <span key="submitted" className="text-success">
          {submitted}
        </span>,
        <span key="english" className="text-text-secondary">
          {answer.english}
        </span>,
      ];
    } else {
      return [
        <span key="simplified" className="text-text-secondary">
          {answer.simplified}
        </span>,
        <span key="traditional" className="text-text-secondary">
          {answer.traditional}
        </span>,
        <span key="pinyin" className="text-text-secondary">
          {answer.correctPinyin}
        </span>,
        <span key="submitted" className="text-error">
          {answer.submittedPinyin}
        </span>,
        <span key="english" className="text-text-secondary">
          {answer.english}
        </span>,
      ];
    }
  });

  if (incorrectAnswers.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm py-4">
        No incorrect answers yet. Keep practicing!
      </div>
    );
  }

  return <Table headers={headers} rows={rows} variant={TableVariant.BORDERED} />;
};
