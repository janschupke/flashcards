import React from 'react';
import { AppTab } from '../../types/layout';
import { TAB_CONSTANTS } from '../../constants/layout';
import { TabButton } from './TabButton';

interface TabNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { value: AppTab.FLASHCARDS, ...TAB_CONSTANTS.FLASHCARDS },
    { value: AppTab.HISTORY, ...TAB_CONSTANTS.HISTORY },
    { value: AppTab.STATISTICS, label: 'Statistics', id: 'statistics', ariaLabel: 'Statistics' },
    { value: AppTab.ABOUT, label: 'About', id: 'about', ariaLabel: 'About' },
  ];

  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const tabId = 'ID' in tab ? tab.ID : tab.id;
        const tabLabel = 'LABEL' in tab ? tab.LABEL : tab.label;
        const tabAriaLabel = 'ARIA_LABEL' in tab ? tab.ARIA_LABEL : tab.ariaLabel;
        return (
          <TabButton
            key={tab.value}
            label={tabLabel}
            isActive={isActive}
            onClick={() => onTabChange(tab.value)}
            id={tabId}
            ariaLabel={tabAriaLabel}
          />
        );
      })}
    </div>
  );
};
