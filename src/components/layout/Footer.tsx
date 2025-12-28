import React from 'react';
import { FOOTER_CONSTANTS } from '../../constants/layout';

export const Footer: React.FC = () => {
  return (
    <footer className="h-8 bg-surface-secondary border-t border-border-primary flex items-center justify-center px-4">
      <p className="text-xs text-text-tertiary">
        © {FOOTER_CONSTANTS.COPYRIGHT_YEAR} {FOOTER_CONSTANTS.COPYRIGHT_TEXT}
      </p>
    </footer>
  );
};
