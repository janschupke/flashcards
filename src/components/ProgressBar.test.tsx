import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('displays correct progress percentage', () => {
    render(<ProgressBar progress={25} />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '25%' });
  });
}); 
