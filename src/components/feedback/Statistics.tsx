import React from 'react';

interface StatisticsProps {
  current: number;
  totalSeen: number;
  limit: number;
  correctAnswers: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  current,
  totalSeen,
  limit,
  correctAnswers,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-5 p-4 bg-background-secondary rounded-xl text-[0.9rem] text-textc-secondary border border-secondary">
      <div className="text-center">
        <div className="font-bold text-primary text-[1.1rem]" data-testid="stat-current">{current + 1}</div>
        <div className="text-[0.8rem] uppercase tracking-[0.5px] mt-1 text-textc-muted">Current</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-primary text-[1.1rem]" data-testid="stat-answers">{correctAnswers} / {totalSeen}</div>
        <div className="text-[0.8rem] uppercase tracking-[0.5px] mt-1 text-textc-muted">Answers</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-primary text-[1.1rem]" data-testid="stat-total">{limit}</div>
        <div className="text-[0.8rem] uppercase tracking-[0.5px] mt-1 text-textc-muted">Total</div>
      </div>
    </div>
  );
};
