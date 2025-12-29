import { ColumnDef } from '@tanstack/react-table';
import { Answer } from '../types';
import { getSubmittedText, getCorrectText } from './answerUtils';
import { getAnswerColorClass } from './styleUtils';

/**
 * Interface for table row data from answers
 */
export interface AnswerRow {
  simplified: string;
  traditional: string;
  expected: string;
  submitted: string;
  submittedClass: string;
  english: string;
}

/**
 * Interface for statistics table row data
 */
export interface StatisticsRow {
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
  correct: number;
  total: number;
  successRate: number;
  successRatePercent: string;
  successRateClass: string;
}

/**
 * Transforms an Answer into an AnswerRow for table display
 * @param answer - The answer to transform
 * @returns Transformed row data
 */
export const transformAnswerToRow = (answer: Answer): AnswerRow => {
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
};

/**
 * Creates column definitions for the statistics table
 * @param sortField - Current sort field
 * @param sortDirection - Current sort direction
 * @param handleSort - Sort handler function
 * @returns Array of column definitions
 */
export const createStatisticsColumns = (
  sortField: 'character' | 'correct' | 'total' | 'successRate',
  sortDirection: 'asc' | 'desc',
  handleSort: (field: 'character' | 'correct' | 'total' | 'successRate') => void
): ColumnDef<StatisticsRow>[] => {
  return [
    {
      header: () => (
        <span
          className="cursor-pointer hover:text-text-secondary"
          onClick={() => handleSort('character')}
        >
          Simplified {sortField === 'character' && (sortDirection === 'asc' ? '↑' : '↓')}
        </span>
      ),
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
      accessorKey: 'pinyin',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
    },
    {
      header: 'English',
      accessorKey: 'english',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as string}</span>,
    },
    {
      header: () => (
        <span
          className="cursor-pointer hover:text-text-secondary"
          onClick={() => handleSort('correct')}
        >
          Correct {sortField === 'correct' && (sortDirection === 'asc' ? '↑' : '↓')}
        </span>
      ),
      accessorKey: 'correct',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as number}</span>,
    },
    {
      header: () => (
        <span
          className="cursor-pointer hover:text-text-secondary"
          onClick={() => handleSort('total')}
        >
          Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
        </span>
      ),
      accessorKey: 'total',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as number}</span>,
    },
    {
      header: () => (
        <span
          className="cursor-pointer hover:text-text-secondary"
          onClick={() => handleSort('successRate')}
        >
          Success Rate {sortField === 'successRate' && (sortDirection === 'asc' ? '↑' : '↓')}
        </span>
      ),
      accessorKey: 'successRatePercent',
      cell: (info) => {
        const row = info.row.original;
        return <span className={row.successRateClass}>{row.successRatePercent}%</span>;
      },
    },
  ];
};
