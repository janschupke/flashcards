import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Answer } from '../../types';
import { PaginatedTable } from '../common/PaginatedTable';
import { getSubmittedText, getCorrectText } from '../../utils/answerUtils';
import { getAnswerColorClass } from '../../utils/styleUtils';

interface HistoryProps {
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

export const History: React.FC<HistoryProps> = ({ allAnswers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reverse order to show newest first
  const reversedAnswers = [...allAnswers].reverse();

  // Transform data for table (always pinyin now)
  const allTableData = useMemo<AnswerRow[]>(() => {
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

  // Filter data based on search query
  const tableData = useMemo<AnswerRow[]>(() => {
    if (!searchQuery.trim()) {
      return allTableData;
    }

    const query = searchQuery.toLowerCase().trim();
    return allTableData.filter((row) => {
      return (
        row.simplified.toLowerCase().includes(query) ||
        row.traditional.toLowerCase().includes(query) ||
        row.expected.toLowerCase().includes(query) ||
        row.submitted.toLowerCase().includes(query) ||
        row.english.toLowerCase().includes(query)
      );
    });
  }, [allTableData, searchQuery]);

  // Define columns (always pinyin)
  const columns = useMemo<ColumnDef<AnswerRow>[]>(() => {
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
  }, []);

  if (allAnswers.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm sm:text-base py-4 px-2 sm:px-4">
        No answers yet. Start practicing!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Search in any column..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border-primary rounded bg-surface-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Paginated Table */}
      <PaginatedTable data={tableData} columns={columns} pageSize={20} />
    </div>
  );
};
