import { render, screen } from '@testing-library/react';
import { PreviousCharacter } from './PreviousCharacter';
import { Answer, FlashcardMode } from '../../types';

describe('PreviousCharacter', () => {
  const mockCorrectAnswer: Answer = {
    characterIndex: 0,
    submittedPinyin: 'wǒ',
    correctPinyin: 'wǒ',
    simplified: '我',
    traditional: '我',
    english: 'I ; me',
    mode: FlashcardMode.PINYIN,
    isCorrect: true,
  };

  const mockIncorrectAnswer: Answer = {
    characterIndex: 1,
    submittedPinyin: 'wo',
    correctPinyin: 'wǒ',
    simplified: '我',
    traditional: '我',
    english: 'I ; me',
    mode: FlashcardMode.PINYIN,
    isCorrect: false,
  };

  const mockEmptyAnswer: Answer = {
    characterIndex: 2,
    submittedPinyin: '(empty)',
    correctPinyin: 'hǎo',
    simplified: '好',
    traditional: '好',
    english: 'good',
    mode: FlashcardMode.PINYIN,
    isCorrect: false,
  };

  it('renders placeholders when previousAnswer is null', () => {
    render(<PreviousCharacter previousAnswer={null} />);
    expect(screen.getByText('Previous Character')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(5); // All placeholders including Submitted
  });

  it('renders previous character information when answer is provided', () => {
    render(<PreviousCharacter previousAnswer={mockCorrectAnswer} />);

    expect(screen.getByText('Previous Character')).toBeInTheDocument();
    expect(screen.getByText('Simplified')).toBeInTheDocument();
    expect(screen.getByText('Traditional')).toBeInTheDocument();
    expect(screen.getByText('Pinyin')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();

    expect(screen.getAllByText('我')).toHaveLength(2); // Simplified and Traditional
    expect(screen.getByText('wǒ')).toBeInTheDocument(); // Pinyin
    expect(screen.getByText('I ; me')).toBeInTheDocument();
    expect(screen.getByText('wǒ')).toBeInTheDocument(); // Submitted (same as correct)
  });

  it('displays correct answer with green color', () => {
    render(<PreviousCharacter previousAnswer={mockCorrectAnswer} />);
    const submittedElement = screen.getByText('wǒ');
    expect(submittedElement).toHaveClass('text-success');
  });

  it('displays incorrect answer with red color', () => {
    render(<PreviousCharacter previousAnswer={mockIncorrectAnswer} />);
    const submittedElement = screen.getByText('wo');
    expect(submittedElement).toHaveClass('text-error');
  });

  it('displays empty answer with red color', () => {
    render(<PreviousCharacter previousAnswer={mockEmptyAnswer} />);
    const submittedElement = screen.getByText('(empty)');
    expect(submittedElement).toHaveClass('text-error');
  });

  it('displays submitted character for character modes', () => {
    const characterAnswer: Answer = {
      characterIndex: 0,
      submittedCharacter: '我',
      correctCharacter: '我',
      simplified: '我',
      traditional: '我',
      english: 'I ; me',
      mode: FlashcardMode.SIMPLIFIED,
      isCorrect: true,
      submittedPinyin: '',
      correctPinyin: '',
    };
    render(<PreviousCharacter previousAnswer={characterAnswer} />);
    expect(screen.getByText('我')).toBeInTheDocument(); // Submitted character
  });
});
