import React from 'react';
import { AppTab } from '../../types/layout';
import { TAB_CONSTANTS } from '../../constants/layout';

interface TabPanelProps {
  tab: AppTab;
  activeTab: AppTab;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ tab, activeTab, children }) => {
  const isActive = tab === activeTab;
  const tabId = tab === AppTab.FLASHCARDS ? TAB_CONSTANTS.FLASHCARDS.ID : TAB_CONSTANTS.HISTORY.ID;

  // FLASHCARDS tab uses flex layout, others need scrolling
  const className = isActive
    ? tab === AppTab.FLASHCARDS
      ? 'block h-full'
      : 'block h-full overflow-y-auto'
    : 'hidden';

  return (
    <div
      role="tabpanel"
      id={`tab-panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={className}
    >
      {isActive && children}
    </div>
  );
};
