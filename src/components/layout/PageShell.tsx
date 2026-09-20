import React from 'react';

interface PageShellProps {
  /**
   * Page heading. Rendered as the h2 under the site h1, and visually hidden
   * when the page already shows its own title -- every route needs a heading
   * even when the design does not show one.
   */
  title: string;
  visuallyHiddenTitle?: boolean;
  children: React.ReactNode;
}

/**
 * The scroll container and centred column shared by every routed page.
 * This markup was duplicated verbatim in all three page components.
 */
export const PageShell: React.FC<PageShellProps> = ({
  title,
  visuallyHiddenTitle = false,
  children,
}) => (
  <div className="h-full overflow-y-auto">
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-(--breakpoint-xl) min-h-full">
      <h2
        className={
          visuallyHiddenTitle ? 'sr-only' : 'text-2xl font-bold text-text-primary mb-4 px-1'
        }
      >
        {title}
      </h2>
      {children}
    </div>
  </div>
);
