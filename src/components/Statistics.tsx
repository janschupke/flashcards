import React from 'react';
import { Stats, StatItem, StatValue, StatLabel } from './styled';

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
    <Stats>
      <StatItem>
        <StatValue data-testid="stat-current">{current + 1}</StatValue>
        <StatLabel>Current</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue data-testid="stat-answers">{correctAnswers} / {totalSeen}</StatValue>
        <StatLabel>Answers</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue data-testid="stat-total">{limit}</StatValue>
        <StatLabel>Total</StatLabel>
      </StatItem>
    </Stats>
  );
}; 
