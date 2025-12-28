import { useState, useMemo } from 'react';
import { getAllCharacterPerformance } from '../utils/storageUtils';
import data from '../data/characters.json';
import { getSuccessRate } from '../utils/adaptiveUtils';

export type SortField = 'character' | 'correct' | 'total' | 'successRate';
export type SortDirection = 'asc' | 'desc';
export type FilterType = 'all' | 'struggling' | 'mastered';

interface StatisticsItem {
  characterIndex: number;
  character: (typeof data)[number] | null;
  correct: number;
  total: number;
  successRate: number;
}

export const useStatistics = (): {
  statisticsData: StatisticsItem[];
  sortedData: StatisticsItem[];
  sortField: SortField;
  sortDirection: SortDirection;
  filter: FilterType;
  filterCounts: { all: number; struggling: number; mastered: number };
  setFilter: (filter: FilterType) => void;
  handleSort: (field: SortField) => void;
} => {
  const [sortField, setSortField] = useState<SortField>('successRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState<FilterType>('all');

  // Load performance data from storage
  const performance = getAllCharacterPerformance();

  // Get character data and calculate success rates
  const statisticsData = useMemo<StatisticsItem[]>(() => {
    return performance.map((perf) => {
      const character = data[perf.characterIndex] ?? null;
      const successRate = getSuccessRate(perf);
      return {
        characterIndex: perf.characterIndex,
        character,
        correct: perf.correct,
        total: perf.total,
        successRate,
      };
    });
  }, [performance]);

  // Filter data
  const filteredData = useMemo(() => {
    return statisticsData.filter((item) => {
      if (filter === 'struggling') {
        return item.successRate < 0.5;
      }
      if (filter === 'mastered') {
        return item.successRate >= 0.8;
      }
      return true;
    });
  }, [statisticsData, filter]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'character': {
          const aChar = a.character?.simplified ?? '';
          const bChar = b.character?.simplified ?? '';
          comparison = aChar.localeCompare(bChar);
          break;
        }
        case 'correct':
          comparison = a.correct - b.correct;
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'successRate':
          comparison = a.successRate - b.successRate;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterCounts = useMemo(() => {
    return {
      all: statisticsData.length,
      struggling: statisticsData.filter((d) => d.successRate < 0.5).length,
      mastered: statisticsData.filter((d) => d.successRate >= 0.8).length,
    };
  }, [statisticsData]);

  return {
    statisticsData,
    sortedData,
    sortField,
    sortDirection,
    filter,
    filterCounts,
    setFilter,
    handleSort,
  };
};
