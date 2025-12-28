import React from 'react';
import { AppTab } from '../../types/layout';
import { TAB_CONSTANTS } from '../../constants/layout';

interface TabNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { value: AppTab.FLASHCARDS, ...TAB_CONSTANTS.FLASHCARDS },
    { value: AppTab.HISTORY, ...TAB_CONSTANTS.HISTORY },
  ];

  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            id={`tab-${tab.ID}`}
            aria-controls={`tab-panel-${tab.ID}`}
            aria-selected={isActive}
            aria-label={tab.ARIA_LABEL}
            onClick={() => onTabChange(tab.value)}
            className={`
              px-3 py-1 rounded-md text-sm font-semibold transition-colors
              ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
              }
            `}
          >
            {tab.LABEL}
          </button>
        );
      })}
    </div>
  );
};
