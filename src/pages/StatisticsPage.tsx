import React from 'react';
import { Statistics } from '../components/feedback/Statistics';
import { PageShell } from '../components/layout/PageShell';

export const StatisticsPage: React.FC = () => {
  return (
    <PageShell title="Statistics">
      <Statistics />
    </PageShell>
  );
};
