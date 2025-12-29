import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useStatistics } from '../../hooks/useStatistics';
import { FilterButton } from '../common/FilterButton';
import { PaginatedTable } from '../common/PaginatedTable';
import { matchesPinyinSearch, getPurpleCultureUrl } from '../../utils/pinyinUtils';

// Component can work standalone by loading from storage
// No props needed - component loads data from storage internally
type StatisticsProps = Record<string, never>;

interface StatisticsRow {
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

export const Statistics: React.FC<StatisticsProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    statisticsData,
    sortedData,
    sortField,
    sortDirection,
    filter,
    filterCounts,
    setFilter,
    handleSort,
  } = useStatistics();

  // Transform data for table
  const allTableData = useMemo<StatisticsRow[]>(() => {
    return sortedData.map((item) => {
      const successRatePercent = (item.successRate * 100).toFixed(1);
      const successRateClass =
        item.successRate >= 0.8
          ? 'text-success'
          : item.successRate >= 0.5
            ? 'text-warning'
            : 'text-error';

      return {
        simplified: item.character?.simplified ?? '?',
        traditional: item.character?.traditional ?? '?',
        pinyin: item.character?.pinyin ?? '?',
        english: item.character?.english ?? '?',
        correct: item.correct,
        total: item.total,
        successRate: item.successRate,
        successRatePercent,
        successRateClass,
      };
    });
  }, [sortedData]);

  // Filter data based on search query (only text columns, not numeric, with pinyin normalization)
  const tableData = useMemo<StatisticsRow[]>(() => {
    if (!searchQuery.trim()) {
      return allTableData;
    }

    const query = searchQuery.toLowerCase().trim();
    return allTableData.filter((row) => {
      // Text columns: simple substring match
      if (
        row.simplified.toLowerCase().includes(query) ||
        row.traditional.toLowerCase().includes(query) ||
        row.english.toLowerCase().includes(query)
      ) {
        return true;
      }

      // Pinyin column: use normalized matching (handles tones, ü/u alternatives)
      if (matchesPinyinSearch(query, row.pinyin)) {
        return true;
      }

      return false;
    });
  }, [allTableData, searchQuery]);

  // Define columns
  const columns = useMemo<ColumnDef<StatisticsRow>[]>(
    () => [
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
    ],
    [sortField, sortDirection, handleSort]
  );

  if (statisticsData.length === 0) {
    return (
      <div className="text-center text-text-tertiary text-sm sm:text-base py-4 px-2 sm:px-4">
        No statistics yet. Start practicing to see your progress!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          label="All"
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
          count={filterCounts.all}
        />
        <FilterButton
          label="Struggling"
          isActive={filter === 'struggling'}
          onClick={() => setFilter('struggling')}
          count={filterCounts.struggling}
        />
        <FilterButton
          label="Mastered"
          isActive={filter === 'mastered'}
          onClick={() => setFilter('mastered')}
          count={filterCounts.mastered}
        />
      </div>

      {/* Search input */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Search in any column..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border-primary rounded bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Paginated Table */}
      <PaginatedTable
        data={tableData}
        columns={columns}
        pageSize={20}
        getRowUrl={(row) => getPurpleCultureUrl(row.simplified)}
      />
    </div>
  );
};
