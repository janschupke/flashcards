import React, { useMemo, useState } from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { FilterButton } from '../common/FilterButton';
import { PaginatedTable } from '../common/PaginatedTable';
import { SearchInput } from '../common/SearchInput';
import { getPurpleCultureUrl } from '../../utils/pinyinUtils';
import { filterTableRows } from '../../utils/searchUtils';
import { formatSuccessRatePercent, getSuccessRateColorClass } from '../../utils/statisticsUtils';
import { createStatisticsColumns, StatisticsRow } from '../../utils/tableUtils';
import { TABLE_CONSTANTS } from '../../constants';

// Component can work standalone by loading from storage
// No props needed - component loads data from storage internally
type StatisticsProps = Record<string, never>;

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
      const successRatePercent = formatSuccessRatePercent(item.successRate);
      const successRateClass = getSuccessRateColorClass(item.successRate);

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
    return filterTableRows(
      allTableData,
      searchQuery,
      ['simplified', 'traditional', 'english'],
      ['pinyin']
    );
  }, [allTableData, searchQuery]);

  // Define columns
  const columns = useMemo(
    () => createStatisticsColumns(sortField, sortDirection, handleSort),
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
