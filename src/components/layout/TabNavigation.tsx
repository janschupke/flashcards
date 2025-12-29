import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppTab } from '../../types/layout';
import { getAllTabs } from '../../constants/layout';
import { TabButton } from './TabButton';
import { getRouteForTab } from '../../utils/routingUtils';

interface TabNavigationProps {
  activeTab: AppTab;
}

export const TabNavigation: React.FC<TabNavigationProps> = () => {
  const tabs = getAllTabs();

  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => {
        const tabId = tab.ID;
        const tabLabel = tab.LABEL;
        const tabAriaLabel = tab.ARIA_LABEL;
        return (
          <NavLink key={tab.value} to={getRouteForTab(tab.value)} className="no-underline">
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
