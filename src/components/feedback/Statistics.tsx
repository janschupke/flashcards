import React from 'react';
import { Card } from '../common/Card';
import { CardPadding } from '../../types/components';

interface StatisticsProps {
  correctAnswers: number;
  totalSeen: number;
}

export const Statistics: React.FC<StatisticsProps> = ({ correctAnswers, totalSeen }) => {
  return (
    <Card padding={CardPadding.SM} className="mt-2">
      <div className="text-center">
        <div className="font-bold text-primary text-base" data-testid="stat-answers">
          {correctAnswers} / {totalSeen}
        </div>
        <div className="text-xs uppercase tracking-wider mt-0.5 text-text-tertiary">Answers</div>
      </div>
    </Card>
  );
};
