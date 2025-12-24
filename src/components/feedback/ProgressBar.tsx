import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div role="progressbar" className="w-full h-2 bg-secondary rounded-full mb-5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-[3px] transition-[width] duration-300"
        style={{ width: `${progress}%` }}
        data-testid="progress-fill"
      />
    </div>
  );
};
