import type { ReactElement } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Answer, SortField, SortDirection } from '../types';
import { getSubmittedText, getCorrectText } from './answerUtils';
import { getAnswerColorClass } from './styleUtils';
import { getPurpleCultureUrl } from './pinyinUtils';

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
 * The simplified character, linked to its Purple Culture entry.
 *
 * This used to be a click handler on the whole <tr> with tabIndex={0}. Giving
 * a table row role="link" overrides its implicit row role and breaks the
 * table's structure; a link belongs inside a cell.
 */
export const CharacterLink = ({ simplified }: { simplified: string }): ReactElement => (
  <a
    href={getPurpleCultureUrl(simplified)}
    target="_blank"
    rel="noopener noreferrer"
    className="text-text-secondary underline decoration-dotted underline-offset-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-border-focus rounded-sm"
  >
    {simplified}
    <span className="sr-only"> (look up on Purple Culture, opens in a new tab)</span>
  </a>
);

/**
 * A sortable column header.
 *
 * These used to be click-only <span>s: not focusable, not operable by
 * keyboard, and with no aria-sort on the header cell. A real <button> gets
 * keyboard operation and an accessible name for free.
 */
const SortableHeader = ({
  label,
  field,
  sortField,
  sortDirection,
  handleSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}): ReactElement => {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => handleSort(field)}
      aria-label={`Sort by ${label}`}
      className="inline-flex items-center gap-1 font-inherit hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus rounded-sm"
    >
      {label}
      <span aria-hidden="true">{isActive ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</span>
    </button>
  );
};

/** Sort state handed to the table through TanStack's `meta`. */
interface SortMeta {
  sortField: SortField;
  sortDirection: SortDirection;
}

/**
 * Creates column definitions for the statistics table.
 *
 * Takes only the handler: current sort state is read per render from the
 * table's `meta`, so this array stays referentially stable and the header
 * buttons are not remounted (and focus not lost) on every sort.
 *
 * @param handleSort - Sort handler function
 * @returns Array of column definitions
 */
export const createStatisticsColumns = (
  handleSort: (field: SortField) => void
): ColumnDef<StatisticsRow>[] => {
  return [
    {
      header: ({ table }) => {
        const { sortField, sortDirection } = table.options.meta as SortMeta;
        return (
          <SortableHeader
            label="Simplified"
            field="character"
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        );
      },
      accessorKey: 'simplified',
      cell: (info) => <CharacterLink simplified={info.getValue() as string} />,
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
      header: ({ table }) => {
        const { sortField, sortDirection } = table.options.meta as SortMeta;
        return (
          <SortableHeader
            label="Correct"
            field="correct"
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        );
      },
      accessorKey: 'correct',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as number}</span>,
    },
    {
      header: ({ table }) => {
        const { sortField, sortDirection } = table.options.meta as SortMeta;
        return (
          <SortableHeader
            label="Total"
            field="total"
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        );
      },
      accessorKey: 'total',
      cell: (info) => <span className="text-text-secondary">{info.getValue() as number}</span>,
    },
    {
      header: ({ table }) => {
        const { sortField, sortDirection } = table.options.meta as SortMeta;
        return (
          <SortableHeader
            label="Success Rate"
            field="successRate"
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        );
      },
      accessorKey: 'successRatePercent',
      cell: (info) => {
        const row = info.row.original;
        return <span className={row.successRateClass}>{row.successRatePercent}%</span>;
      },
    },
  ];
};
