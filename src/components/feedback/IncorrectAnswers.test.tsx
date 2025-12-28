import { render, screen } from '@testing-library/react';
import { IncorrectAnswers } from './IncorrectAnswers';
import { IncorrectAnswer, FlashcardMode } from '../../types';

describe('IncorrectAnswers', () => {
  const mockIncorrectAnswers: IncorrectAnswer[] = [
    {
      characterIndex: 0,
      submittedPinyin: 'wo',
      correctPinyin: 'wǒ',
      simplified: '我',
      traditional: '我',
      english: 'I ; me',
      mode: FlashcardMode.PINYIN,
    },
    {
      characterIndex: 1,
      submittedPinyin: '(empty)',
      correctPinyin: 'de',
      simplified: '的',
      traditional: '的',
      english: 'possessive p.',
      mode: FlashcardMode.PINYIN,
    },
  ];

  it('shows empty message when no incorrect answers', () => {
    render(<IncorrectAnswers incorrectAnswers={[]} />);

    expect(screen.getByText('No incorrect answers yet. Keep practicing!')).toBeInTheDocument();
  });

  it('displays correct answer information in table', () => {
    render(<IncorrectAnswers incorrectAnswers={mockIncorrectAnswers} />);

    // Check first answer - use getAllByText for elements that might appear multiple times
    expect(screen.getAllByText('我').length).toBeGreaterThan(0);
    expect(screen.getAllByText('wǒ').length).toBeGreaterThan(0);
    expect(screen.getByText('I ; me')).toBeInTheDocument();
    expect(screen.getByText('wo')).toBeInTheDocument(); // submitted

    // Check second answer
    expect(screen.getAllByText('的').length).toBeGreaterThan(0);
    expect(screen.getAllByText('de').length).toBeGreaterThan(0);
    expect(screen.getByText('possessive p.')).toBeInTheDocument();
    expect(screen.getByText('(empty)')).toBeInTheDocument(); // submitted
  });
});
