import React from 'react';
import { Stats, StatItem, StatValue, StatLabel } from './styled';

interface StatisticsProps {
  current: number;
  totalSeen: number;
  limit: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  current,
  totalSeen,
  limit,
}) => {
  return (
    <Stats>
      <StatItem>
        <StatValue data-testid="stat-current">{current + 1}</StatValue>
        <StatLabel>Current</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue data-testid="stat-seen">{totalSeen}</StatValue>
        <StatLabel>Seen</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue data-testid="stat-total">{limit}</StatValue>
        <StatLabel>Total</StatLabel>
      </StatItem>
    </Stats>
  );
}; 
