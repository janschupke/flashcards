import { render, screen } from '@testing-library/react';
import { IncorrectAnswers } from './IncorrectAnswers';
import { Answer } from '../../types';

describe('IncorrectAnswers', () => {
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
    render(<IncorrectAnswers allAnswers={[]} />);

    expect(screen.getByText('No answers yet. Start practicing!')).toBeInTheDocument();
  });

  it('displays all answers in table with newest first', () => {
    render(<IncorrectAnswers allAnswers={mockAllAnswers} />);

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
    render(<IncorrectAnswers allAnswers={mockAllAnswers} />);

    // Get all table rows
    const rows = screen.getAllByRole('row');
    // First row is header, so check second row (first data row) should be the last answer
    expect(rows[1]).toHaveTextContent('一'); // Last answer should appear first
  });
});
