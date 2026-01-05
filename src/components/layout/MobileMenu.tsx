import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getAllTabs } from '../../constants/layout';
import { getRouteForTab } from '../../utils/routingUtils';
import cn from 'classnames';

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const prevPathnameRef = useRef<string>(location.pathname);

  const tabs = getAllTabs();

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
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('overflow-hidden');
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
        className={cn(
          'fixed top-12 left-0 right-0 z-50 bg-surface-primary border-t border-border-primary shadow-lg overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        )}
      >
        <nav className="flex flex-col">
          {tabs.map((tab) => {
            const tabLabel = tab.LABEL;
            const tabAriaLabel = tab.ARIA_LABEL;
            const isActive = location.pathname === getRouteForTab(tab.value);
            return (
              <NavLink
                key={tab.value}
                to={getRouteForTab(tab.value)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-text-on-primary'
                    : 'text-text-primary hover:bg-surface-secondary'
                )}
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
