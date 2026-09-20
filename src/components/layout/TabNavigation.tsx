import React from 'react';
import { getAllTabs } from '../../constants/layout';
import { TabButton } from './TabButton';
import { getRouteForTab } from '../../utils/routingUtils';

export const TabNavigation: React.FC = () => {
  const tabs = getAllTabs();

  // A plain list of links. The previous role="tablist" was a false promise:
  // there were no tabpanels, and its children were anchors rather than tabs.
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <TabButton key={tab.value} label={tab.LABEL} to={getRouteForTab(tab.value)} />
      ))}
    </div>
  );
};
