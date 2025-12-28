import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppTab } from '../../types/layout';
import { TAB_CONSTANTS } from '../../constants/layout';
import { TabButton } from './TabButton';

interface TabNavigationProps {
  activeTab: AppTab;
}

const getRouteForTab = (tab: AppTab): string => {
  switch (tab) {
    case AppTab.FLASHCARDS:
      return '/';
    case AppTab.HISTORY:
      return '/history';
    case AppTab.STATISTICS:
      return '/statistics';
    case AppTab.ABOUT:
      return '/about';
    default:
      return '/';
  }
};

export const TabNavigation: React.FC<TabNavigationProps> = () => {
  const tabs = [
    { value: AppTab.FLASHCARDS, ...TAB_CONSTANTS.FLASHCARDS },
    { value: AppTab.HISTORY, ...TAB_CONSTANTS.HISTORY },
    { value: AppTab.STATISTICS, label: 'Statistics', id: 'statistics', ariaLabel: 'Statistics' },
    { value: AppTab.ABOUT, label: 'About', id: 'about', ariaLabel: 'About' },
  ];

  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => {
        const tabId = 'ID' in tab ? tab.ID : tab.id;
        const tabLabel = 'LABEL' in tab ? tab.LABEL : tab.label;
        const tabAriaLabel = 'ARIA_LABEL' in tab ? tab.ARIA_LABEL : tab.ariaLabel;
        return (
          <NavLink
            key={tab.value}
            to={getRouteForTab(tab.value)}
            className="no-underline"
          >
            {({ isActive }) => (
              <TabButton
                label={tabLabel}
                isActive={isActive}
                onClick={() => {}}
                id={tabId}
                ariaLabel={tabAriaLabel}
              />
            )}
          </NavLink>
        );
      })}
    </div>
  );
};
