import React from 'react';
import { About } from '../components/feedback/About';
import { PageShell } from '../components/layout/PageShell';

export const AboutPage: React.FC = () => {
  // About renders its own "About This App" heading, so the shell's is hidden.
  return (
    <PageShell title="About" visuallyHiddenTitle>
      <About />
    </PageShell>
  );
};
