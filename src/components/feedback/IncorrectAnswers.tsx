import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Answer, FlashcardMode } from '../../types';
import { PaginatedTable } from '../common/PaginatedTable';
import { getSubmittedText, getCorrectText } from '../../utils/answerUtils';
import { getAnswerColorClass } from '../../utils/styleUtils';

interface IncorrectAnswersProps {
  allAnswers: Answer[];
}

interface AnswerRow {
  simplified: string;
  traditional: string;
  expected: string;
  submitted: string;
  submittedClass: string;
  english: string;
}

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({ allAnswers }) => {
  // Reverse order to show newest first
  const reversedAnswers = [...allAnswers].reverse();

  const hasCharacterModes = allAnswers.some((answer) => answer.mode !== FlashcardMode.PINYIN);

  // Transform data for table
  const tableData = useMemo<AnswerRow[]>(() => {
    return reversedAnswers.map((answer) => {
      const submittedText = getSubmittedText(answer);
      const correctText = getCorrectText(answer);
      const submittedClass = getAnswerColorClass(answer.isCorrect);

      return {
        simplified: answer.simplified,
        traditional: answer.traditional,
        expected: correctText,
        submitted: submittedText,
        submittedClass,
        english: answer.english,
      };
    });
  }, [reversedAnswers]);

  // Define columns based on mode
  const columns = useMemo<ColumnDef<AnswerRow>[]>(() => {
    if (hasCharacterModes) {
      return [
        {
          header: 'Simplified',
          accessorKey: 'simplified',
          cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
        },
        {
          header: 'Traditional',
          accessorKey: 'traditional',
          cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
        },
        {
          header: 'Expected',
          accessorKey: 'expected',
          cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
        },
        {
          header: 'Submitted',
          accessorKey: 'submitted',
          cell: (info) => {
            const row = info.row.original;
            return <span className={row.submittedClass}>{row.submitted}</span>;
          },
        },
        {
          header: 'English',
          accessorKey: 'english',
          cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
        },
      ];
    }
    return [
      {
        header: 'Simplified',
        accessorKey: 'simplified',
        cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
      },
      {
        header: 'Traditional',
        accessorKey: 'traditional',
        cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
      },
      {
        header: 'Pinyin',
        accessorKey: 'expected',
        cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
      },
      {
        header: 'Submitted',
        accessorKey: 'submitted',
        cell: (info) => {
          const row = info.row.original;
          return <span className={row.submittedClass}>{row.submitted}</span>;
        },
      },
      {
        header: 'English',
        accessorKey: 'english',
        cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
      },
    ];
  }, [hasCharacterModes]);

  if (allAnswers.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm sm:text-base py-4 px-2 sm:px-4">
        No answers yet. Start practicing!
      </div>
    );
  }

  return <PaginatedTable data={tableData} columns={columns} pageSize={20} />;
};
