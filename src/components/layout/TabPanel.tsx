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

  return (
    <div
      role="tabpanel"
      id={`tab-panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={isActive ? 'block' : 'hidden'}
    >
      {isActive && children}
    </div>
  );
};
