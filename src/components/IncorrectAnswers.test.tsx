import { render, screen, fireEvent } from '@testing-library/react';
import { IncorrectAnswers } from './IncorrectAnswers';
import { IncorrectAnswer } from '../types';

describe('IncorrectAnswers', () => {
  const mockIncorrectAnswers: IncorrectAnswer[] = [
    {
      characterIndex: 0,
      submittedPinyin: 'wo',
      correctPinyin: 'wǒ',
      chinese: '我',
      english: 'I ; me',
    },
    {
      characterIndex: 1,
      submittedPinyin: '(empty)',
      correctPinyin: 'de',
      chinese: '的',
      english: 'possessive p.',
    },
  ];

  it('renders with correct title and count', () => {
    render(<IncorrectAnswers incorrectAnswers={mockIncorrectAnswers} />);
    
    expect(screen.getByText('Incorrect Answers (2)')).toBeInTheDocument();
  });

  it('shows empty message when no incorrect answers', () => {
    render(<IncorrectAnswers incorrectAnswers={[]} />);
    
    expect(screen.getByText('No incorrect answers yet. Keep practicing!')).toBeInTheDocument();
  });

  it('toggles expansion when header is clicked', () => {
    render(<IncorrectAnswers incorrectAnswers={mockIncorrectAnswers} />);
    
    const header = screen.getByText('Incorrect Answers (2)').closest('div');
    expect(header).toBeInTheDocument();
    
    // Use test id to select the collapsible content
    const content = screen.getByTestId('incorrect-answers-content');
    expect(content).toHaveStyle('opacity: 0');
    
    // Click to expand
    fireEvent.click(header!);
    expect(content).toHaveStyle('opacity: 1');
    
    // Click to collapse
    fireEvent.click(header!);
    expect(content).toHaveStyle('opacity: 0');
  });

  it('displays correct answer information when expanded', () => {
    render(<IncorrectAnswers incorrectAnswers={mockIncorrectAnswers} />);
    
    const header = screen.getByText('Incorrect Answers (2)').closest('div');
    fireEvent.click(header!);
    
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
