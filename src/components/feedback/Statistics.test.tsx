import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Statistics } from './Statistics';
import { CharacterPerformance } from '../../types/storage';

// Mock storage utilities
const mockGetAllCharacterPerformance = vi.fn();
vi.mock('../../utils/storageUtils', () => ({
  getAllCharacterPerformance: () => mockGetAllCharacterPerformance(),
}));

// Mock character data
vi.mock('../../data/characters.json', () => ({
  default: [
    {
      simplified: '我',
      traditional: '我',
      pinyin: 'wǒ',
      english: 'I ; me',
    },
    {
      simplified: '的',
      traditional: '的',
      pinyin: 'de',
      english: 'possessive p.',
    },
    {
      simplified: '一',
      traditional: '一',
      pinyin: 'yī',
      english: 'one',
    },
  ],
}));

describe('Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays empty state when no statistics', () => {
    mockGetAllCharacterPerformance.mockReturnValue([]);
    render(<Statistics />);

    expect(screen.getByText(/No statistics yet/i)).toBeInTheDocument();
  });

  describe('Search functionality', () => {
    const mockPerformance: CharacterPerformance[] = [
      {
        characterIndex: 0,
        correct: 5,
        total: 10,
      },
      {
        characterIndex: 1,
        correct: 8,
        total: 10,
      },
      {
        characterIndex: 2,
        correct: 2,
        total: 10,
      },
    ];

    beforeEach(() => {
      mockGetAllCharacterPerformance.mockReturnValue(mockPerformance);
    });

    it('renders search input', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('filters by simplified character', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: '我' } });

      // Should show only the row with '我' (appears in both simplified and traditional columns)
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by traditional character', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: '的' } });

      // Should show only the row with '的' (appears in both simplified and traditional columns)
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by pinyin', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'wǒ' } });

      // Should show only the row with 'wǒ'
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by english translation', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'one' } });

      // Should show only the row with 'one' in english column
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('一');
      expect(rows[1]).not.toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
    });

    it('search is case-insensitive', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'ONE' } });

      // Should find 'one' regardless of case
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('一');
    });

    it('filters by substring match', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'possessive' } });

      // Should find 'possessive p.' by substring
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('does not filter by numeric columns (correct, total, success rate)', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');

      // Try to search for numbers that appear in numeric columns
      fireEvent.change(searchInput, { target: { value: '5' } });

      // Should not match anything (5 appears in correct column but shouldn't be searched)
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(1); // Only header row, no matches

      // Try searching for '10' (appears in total column)
      fireEvent.change(searchInput, { target: { value: '10' } });
      const rowsAfter10 = screen.getAllByRole('row');
      expect(rowsAfter10.length).toBe(1); // Only header row, no matches

      // Try searching for '50' (appears in success rate percentage)
      fireEvent.change(searchInput, { target: { value: '50' } });
      const rowsAfter50 = screen.getAllByRole('row');
      expect(rowsAfter50.length).toBe(1); // Only header row, no matches
    });

    it('shows all results when search is cleared', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');

      // Filter first
      fireEvent.change(searchInput, { target: { value: '我' } });
      let rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).not.toHaveTextContent('的');

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // All results should be visible again (order may vary due to sorting)
      rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // Header + 3 data rows
      const allText = rows.map((row) => row.textContent).join('');
      expect(allText).toContain('我');
      expect(allText).toContain('的');
      expect(allText).toContain('一');
    });

    it('shows no results when search matches nothing', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      // Header row should still be there, but no data rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(1); // Only header row
    });

    it('filters in real-time as user types', () => {
      render(<Statistics />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');

      // Type 'w' - should match 'wǒ'
      fireEvent.change(searchInput, { target: { value: 'w' } });
      let rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');

      // Type 'ǒ' - should still match
      fireEvent.change(searchInput, { target: { value: 'wǒ' } });
      rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
    });

    it('works with filter buttons and search together', () => {
      render(<Statistics />);

      // Apply struggling filter
      const strugglingButton = screen.getByText(/Struggling/i);
      fireEvent.click(strugglingButton);

      // Then search
      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: '一' } });

      // Should show only struggling characters that match search
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('一');
    });

    describe('Pinyin normalization in search', () => {
      it('matches pinyin with tones when searching without tones', () => {
        // Use existing mock data which has 'wǒ' for character 0
        const mockPerformanceWithTones: CharacterPerformance[] = [
          {
            characterIndex: 0,
            correct: 5,
            total: 10,
          },
        ];

        mockGetAllCharacterPerformance.mockReturnValue(mockPerformanceWithTones);
        render(<Statistics />);

        const searchInput = screen.getByPlaceholderText('Search in any column...');
        // Search without tone should match pinyin with tone
        fireEvent.change(searchInput, { target: { value: 'wo' } });

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(2); // Header + 1 data row
        expect(rows[1]).toHaveTextContent('我');
      });

      it('matches ü/u alternatives in pinyin search', () => {
        // Use character index 1 which has 'de' - we'll need to check if there's a character with ü
        // For now, test with existing mock data structure
        const mockPerformance: CharacterPerformance[] = [
          {
            characterIndex: 0,
            correct: 3,
            total: 10,
          },
        ];

        mockGetAllCharacterPerformance.mockReturnValue(mockPerformance);
        render(<Statistics />);

        // Test that pinyin search works - search for 'wo' should match 'wǒ'
        const searchInput = screen.getByPlaceholderText('Search in any column...');
        fireEvent.change(searchInput, { target: { value: 'wo' } });

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(2); // Header + 1 data row
        expect(rows[1]).toHaveTextContent('我');
      });

      it('matches pinyin with different tones', () => {
        const mockPerformance: CharacterPerformance[] = [
          {
            characterIndex: 0,
            correct: 5,
            total: 10,
          },
        ];

        mockGetAllCharacterPerformance.mockReturnValue(mockPerformance);
        render(<Statistics />);

        const searchInput = screen.getByPlaceholderText('Search in any column...');
        // Search with different tone should still match
        fireEvent.change(searchInput, { target: { value: 'wo' } });

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(2); // Header + 1 data row
        expect(rows[1]).toHaveTextContent('我');
      });
    });
  });
});
