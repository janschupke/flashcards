import React, { useMemo } from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { FilterButton } from '../common/FilterButton';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StatisticsProps {
  // Component can work standalone by loading from storage
}

export const Statistics: React.FC<StatisticsProps> = () => {
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

  // Generate table rows
  const rows = useMemo(() => {
    return sortedData.map((item) => {
      const successRatePercent = (item.successRate * 100).toFixed(1);
      const successRateClass =
        item.successRate >= 0.8
          ? 'text-success'
          : item.successRate >= 0.5
            ? 'text-warning'
            : 'text-error';

      return [
        <span key="simplified" className="text-text-secondary">
          {item.character?.simplified ?? '?'}
        </span>,
        <span key="traditional" className="text-text-secondary">
          {item.character?.traditional ?? '?'}
        </span>,
        <span key="pinyin" className="text-text-secondary">
          {item.character?.pinyin ?? '?'}
        </span>,
        <span key="english" className="text-text-secondary">
          {item.character?.english ?? '?'}
        </span>,
        <span key="correct" className="text-text-secondary">
          {item.correct}
        </span>,
        <span key="total" className="text-text-secondary">
          {item.total}
        </span>,
        <span key="successRate" className={successRateClass}>
          {successRatePercent}%
        </span>,
      ];
    });
  }, [sortedData]);

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-primary">
              <th
                className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase cursor-pointer hover:text-text-secondary"
                onClick={() => handleSort('character')}
              >
                Simplified {sortField === 'character' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase">
                Traditional
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase">
                Pinyin
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase">
                English
              </th>
              <th
                className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase cursor-pointer hover:text-text-secondary"
                onClick={() => handleSort('correct')}
              >
                Correct {sortField === 'correct' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase cursor-pointer hover:text-text-secondary"
                onClick={() => handleSort('total')}
              >
                Total {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-2 py-2 text-left text-xs font-semibold text-text-tertiary uppercase cursor-pointer hover:text-text-secondary"
                onClick={() => handleSort('successRate')}
              >
                Success Rate {sortField === 'successRate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-border-secondary">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-2 py-2 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
