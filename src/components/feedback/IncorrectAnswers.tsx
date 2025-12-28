import React from 'react';
import { Answer, FlashcardMode } from '../../types';
import { Table } from '../common/Table';
import { TableVariant } from '../../types/components';

interface IncorrectAnswersProps {
  allAnswers: Answer[];
}

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({ allAnswers }) => {
  const getSubmittedColumn = (answer: Answer): string => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.submittedPinyin;
    } else {
      return answer.submittedCharacter ?? '(empty)';
    }
  };

  const getCorrectColumn = (answer: Answer): string => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.correctPinyin;
    } else {
      return answer.correctCharacter ?? '';
    }
  };

  // Reverse order to show newest first
  const reversedAnswers = [...allAnswers].reverse();

  const hasCharacterModes = allAnswers.some((answer) => answer.mode !== FlashcardMode.PINYIN);

  const headers = hasCharacterModes
    ? ['Simplified', 'Traditional', 'Expected', 'Submitted', 'English']
    : ['Simplified', 'Traditional', 'Pinyin', 'Submitted', 'English'];

  const rows = reversedAnswers.map((answer) => {
    const submitted = getSubmittedColumn(answer);
    const correct = getCorrectColumn(answer);
    const submittedColorClass = answer.isCorrect ? 'text-success' : 'text-error';

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
        <span key="submitted" className={submittedColorClass}>
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
        <span key="submitted" className={submittedColorClass}>
          {submitted}
        </span>,
        <span key="english" className="text-text-secondary">
          {answer.english}
        </span>,
      ];
    }
  });

  if (allAnswers.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm sm:text-base py-4 px-2 sm:px-4">
        No answers yet. Start practicing!
      </div>
    );
  }

  return <Table headers={headers} rows={rows} variant={TableVariant.BORDERED} />;
};
