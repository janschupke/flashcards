import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppTab } from '../../types/layout';
import { TAB_CONSTANTS } from '../../constants/layout';

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

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);

  const tabs = [
    { value: AppTab.FLASHCARDS, ...TAB_CONSTANTS.FLASHCARDS },
    { value: AppTab.HISTORY, ...TAB_CONSTANTS.HISTORY },
    { value: AppTab.STATISTICS, label: 'Statistics', id: 'statistics', ariaLabel: 'Statistics' },
    { value: AppTab.ABOUT, label: 'About', id: 'about', ariaLabel: 'About' },
  ];

  // Close menu when route changes
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      // Defer state update to avoid setState in effect warning
      setTimeout(() => {
        setIsOpen(false);
      }, 0);
    }
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative md:hidden" ref={menuRef}>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={toggleMenu}
        className="p-2 rounded-md text-text-primary hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Menu dropdown */}
      <div
        className={`fixed top-12 left-0 right-0 bg-surface-primary border-t border-border-primary shadow-lg overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col">
          {tabs.map((tab) => {
            const tabLabel = 'LABEL' in tab ? tab.LABEL : tab.label;
            const tabAriaLabel = 'ARIA_LABEL' in tab ? tab.ARIA_LABEL : tab.ariaLabel;
            const isActive = location.pathname === getRouteForTab(tab.value);
            return (
              <NavLink
                key={tab.value}
                to={getRouteForTab(tab.value)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-text-on-primary'
                    : 'text-text-primary hover:bg-surface-secondary'
                }`}
                aria-label={tabAriaLabel}
                onClick={() => setIsOpen(false)}
              >
                {tabLabel}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
