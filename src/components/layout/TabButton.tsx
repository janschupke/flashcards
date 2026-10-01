import React from 'react';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';

interface TabButtonProps {
  label: string;
  to: string;
}

/**
 * A top-level navigation link, styled like a button.
 *
 * This was previously a <button role="tab"> nested inside a <NavLink>, which
 * produced an anchor wrapping a button, an aria-controls pointing at a
 * tab-panel id that existed nowhere, a tablist whose children were links, and
 * a no-op onClick while the anchor did the actual navigating. It is a link, so
 * it is now one element: a link, marked aria-current when it is the open page.
 */
export const TabButton: React.FC<TabButtonProps> = ({ label, to }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      cn(
        'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md no-underline transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-text-on-primary hover:bg-primary-hover'
          : 'bg-surface-secondary text-text-primary border border-border-primary hover:bg-surface-hover'
      )
    }
  >
    {label}
  </NavLink>
);
