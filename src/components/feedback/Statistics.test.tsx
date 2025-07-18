
import { render, screen } from '@testing-library/react';
import { Statistics } from './Statistics';

describe('Statistics', () => {
  it('displays all statistics correctly', () => {
    render(
      <Statistics
        current={5}
        totalSeen={10}
        limit={100}
        correctAnswers={7}
      />
    );

    expect(screen.getByTestId('stat-current')).toHaveTextContent('6');
    expect(screen.getByTestId('stat-answers')).toHaveTextContent('7 / 10');
    expect(screen.getByTestId('stat-total')).toHaveTextContent('100');
  });
}); 
