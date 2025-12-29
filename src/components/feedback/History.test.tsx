import { render, screen, fireEvent } from '@testing-library/react';
import { History } from './History';
import { Answer } from '../../types';

describe('History', () => {
  const mockAllAnswers: Answer[] = [
    {
      characterIndex: 0,
      submittedPinyin: 'wo',
      correctPinyin: 'wǒ',
      simplified: '我',
      traditional: '我',
      english: 'I ; me',
      isCorrect: false,
    },
    {
      characterIndex: 1,
      submittedPinyin: '(empty)',
      correctPinyin: 'de',
      simplified: '的',
      traditional: '的',
      english: 'possessive p.',
      isCorrect: false,
    },
    {
      characterIndex: 2,
      submittedPinyin: 'yī',
      correctPinyin: 'yī',
      simplified: '一',
      traditional: '一',
      english: 'one',
      isCorrect: true,
    },
  ];

  it('shows empty message when no answers', () => {
    render(<History allAnswers={[]} />);

    expect(screen.getByText('No answers yet. Start practicing!')).toBeInTheDocument();
  });

  it('displays all answers in table with newest first', () => {
    render(<History allAnswers={mockAllAnswers} />);

    // Check that all answers are displayed (newest first, so last item in array appears first)
    expect(screen.getAllByText('一').length).toBeGreaterThan(0); // Last answer (newest)
    expect(screen.getAllByText('的').length).toBeGreaterThan(0);
    expect(screen.getAllByText('我').length).toBeGreaterThan(0);

    // Check submitted answers (yī appears in both Pinyin and Submitted columns)
    expect(screen.getAllByText('yī').length).toBeGreaterThan(0); // Correct answer (green)
    expect(screen.getByText('wo')).toBeInTheDocument(); // Incorrect answer (red)
    expect(screen.getByText('(empty)')).toBeInTheDocument(); // Empty answer (red)
  });

  it('displays answers in reverse order (newest first)', () => {
    render(<History allAnswers={mockAllAnswers} />);

    // Get all table rows
    const rows = screen.getAllByRole('row');
    // First row is header, so check second row (first data row) should be the last answer
    expect(rows[1]).toHaveTextContent('一'); // Last answer should appear first
  });

  describe('Search functionality', () => {
    it('renders search input', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('filters by simplified character', () => {
      render(<History allAnswers={mockAllAnswers} />);

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
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: '的' } });

      // Should show only the row with '的'
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by pinyin (expected)', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'wǒ' } });

      // Should show only the row with 'wǒ' in expected column
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by submitted pinyin', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'wo' } });

      // Should show only the row with 'wo' in submitted column
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('filters by english translation', () => {
      render(<History allAnswers={mockAllAnswers} />);

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
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'ONE' } });

      // Should find 'one' regardless of case
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('一');
    });

    it('filters by substring match', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'possessive' } });

      // Should find 'possessive p.' by substring
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('的');
      expect(rows[1]).not.toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('一');
    });

    it('shows all results when search is cleared', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');

      // Filter first
      fireEvent.change(searchInput, { target: { value: '我' } });
      let rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).not.toHaveTextContent('的');

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // All results should be visible again
      rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // Header + 3 data rows
      const allText = rows.map((row) => row.textContent).join('');
      expect(allText).toContain('我');
      expect(allText).toContain('的');
      expect(allText).toContain('一');
    });

    it('shows no results when search matches nothing', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      // Header row should still be there, but no data rows
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(1); // Only header row
    });

    it('filters in real-time as user types', () => {
      render(<History allAnswers={mockAllAnswers} />);

      const searchInput = screen.getByPlaceholderText('Search in any column...');

      // Type 'w' - should match 'wo' and 'wǒ'
      fireEvent.change(searchInput, { target: { value: 'w' } });
      let rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');

      // Type 'o' - should still match
      fireEvent.change(searchInput, { target: { value: 'wo' } });
      rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      expect(rows[1]).toHaveTextContent('我');
      expect(rows[1]).not.toHaveTextContent('的');
    });
  });
});
