import React from 'react';
import { ProgressBar as StyledProgressBar, ProgressFill } from '../styled';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <StyledProgressBar>
      <ProgressFill $progress={progress} data-testid="progress-fill" />
    </StyledProgressBar>
  );
}; 
