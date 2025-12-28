import { render, screen } from '@testing-library/react';
import { Statistics } from './Statistics';

describe('Statistics', () => {
  it('displays statistics correctly', () => {
    render(<Statistics totalSeen={10} correctAnswers={7} />);

    expect(screen.getByTestId('stat-answers')).toHaveTextContent('7 / 10');
  });
});
