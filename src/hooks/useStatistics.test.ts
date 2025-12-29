import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStatistics } from './useStatistics';
import * as storageUtils from '../utils/storageUtils';
import * as adaptiveUtils from '../utils/adaptiveUtils';

// Mock dependencies
vi.mock('../utils/storageUtils');
vi.mock('../utils/adaptiveUtils');
vi.mock('../data/characters.json', () => ({
  default: [
    { simplified: '一', traditional: '一', pinyin: 'yī', english: 'one' },
    { simplified: '二', traditional: '二', pinyin: 'èr', english: 'two' },
  ],
}));

describe('useStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return statistics data with correct structure', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 5, total: 10 },
      { characterIndex: 1, correct: 8, total: 10 },
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    expect(result.current.statisticsData).toHaveLength(2);
    expect(result.current.statisticsData[0]).toMatchObject({
      characterIndex: 0,
      correct: 5,
      total: 10,
      successRate: 0.5,
    });
  });

  it('should filter struggling characters correctly', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 2, total: 10 }, // 20% - struggling
      { characterIndex: 1, correct: 6, total: 10 }, // 60% - learning
      { characterIndex: 2, correct: 9, total: 10 }, // 90% - mastered
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    // Set filter to struggling
    result.current.setFilter('struggling');

    expect(result.current.sortedData).toHaveLength(1);
    expect(result.current.sortedData[0]?.successRate).toBeLessThan(0.5);
  });

  it('should filter mastered characters correctly', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 2, total: 10 }, // 20% - struggling
      { characterIndex: 1, correct: 6, total: 10 }, // 60% - learning
      { characterIndex: 2, correct: 9, total: 10 }, // 90% - mastered
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    // Set filter to mastered
    result.current.setFilter('mastered');

    expect(result.current.sortedData).toHaveLength(1);
    expect(result.current.sortedData[0]?.successRate).toBeGreaterThanOrEqual(0.8);
  });

  it('should sort data correctly', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 5, total: 10 }, // 50%
      { characterIndex: 1, correct: 8, total: 10 }, // 80%
      { characterIndex: 2, correct: 3, total: 10 }, // 30%
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    // Sort by success rate ascending
    result.current.handleSort('successRate');

    expect(result.current.sortField).toBe('successRate');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedData[0]?.successRate).toBe(0.3);
    expect(result.current.sortedData[2]?.successRate).toBe(0.8);
  });

  it('should toggle sort direction when clicking same field', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 5, total: 10 },
      { characterIndex: 1, correct: 8, total: 10 },
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    // First sort
    result.current.handleSort('successRate');
    expect(result.current.sortDirection).toBe('asc');

    // Toggle direction
    result.current.handleSort('successRate');
    expect(result.current.sortDirection).toBe('desc');
  });

  it('should calculate filter counts correctly', () => {
    const mockPerformance = [
      { characterIndex: 0, correct: 2, total: 10 }, // struggling
      { characterIndex: 1, correct: 6, total: 10 }, // learning
      { characterIndex: 2, correct: 9, total: 10 }, // mastered
    ];

    vi.mocked(storageUtils.getAllCharacterPerformance).mockReturnValue(mockPerformance);
    vi.mocked(adaptiveUtils.getSuccessRate).mockImplementation((perf) => {
      if (!perf) return 0;
      return perf.correct / perf.total;
    });

    const { result } = renderHook(() => useStatistics());

    expect(result.current.filterCounts.all).toBe(3);
    expect(result.current.filterCounts.struggling).toBe(1);
    expect(result.current.filterCounts.mastered).toBe(1);
  });
});

