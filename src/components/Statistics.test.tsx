import React from 'react';
import { render, screen } from '@testing-library/react';
import { Statistics } from './Statistics';

describe('Statistics', () => {
  it('displays correct statistics', () => {
    render(<Statistics current={0} totalSeen={5} limit={10} />);
    expect(screen.getByTestId('stat-current')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-seen')).toHaveTextContent('5');
    expect(screen.getByTestId('stat-total')).toHaveTextContent('10');
  });
}); 
