import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Answer } from '../../types';
import { PaginatedTable } from '../common/PaginatedTable';
import { SearchInput } from '../common/SearchInput';
import { getPurpleCultureUrl } from '../../utils/pinyinUtils';
import { filterTableRows } from '../../utils/searchUtils';
import { transformAnswerToRow, AnswerRow } from '../../utils/tableUtils';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';
import { TABLE_CONSTANTS } from '../../constants';

interface HistoryProps {
  allAnswers: Answer[];
}

export const History: React.FC<HistoryProps> = ({ allAnswers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reverse order to show newest first
  const reversedAnswers = [...allAnswers].reverse();

  // Transform data for table (always pinyin now)
  const allTableData = useMemo<AnswerRow[]>(() => {
    return reversedAnswers.map(transformAnswerToRow);
  }, [reversedAnswers]);

  // Filter data based on search query (with pinyin normalization)
  const tableData = useMemo<AnswerRow[]>(() => {
    return filterTableRows(
      allTableData,
      searchQuery,
      ['simplified', 'traditional', 'english'],
      ['expected', 'submitted']
    );
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
      {/* Note about history limit - shown when at limit (app always enforces this) */}
      {allAnswers.length === ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES && (
        <div className="text-xs sm:text-sm text-text-tertiary text-center">
          Showing last {ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES} answers
        </div>
      )}

      {/* Search input */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Paginated Table */}
      <PaginatedTable
        data={tableData}
        columns={columns}
        pageSize={TABLE_CONSTANTS.DEFAULT_PAGE_SIZE}
        getRowUrl={(row) => getPurpleCultureUrl(row.simplified)}
      />
    </div>
  );
};
